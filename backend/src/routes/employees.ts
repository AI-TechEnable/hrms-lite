import { Router } from 'express';
import prisma from '../prisma';
import { createEmployeeSchema } from '../validation';

const router = Router();

// Create employee
router.post('/', async (req, res, next) => {
  try {
    const parsed = createEmployeeSchema.parse(req.body);

    const existing = await prisma.employee.findFirst({
      where: {
        OR: [
          { employeeCode: parsed.employeeCode },
          { email: parsed.email },
        ],
      },
    });

    if (existing) {
      return res.status(409).json({
        message: 'Employee with same ID or email already exists',
      });
    }

    const employee = await prisma.employee.create({
      data: parsed,
    });

    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
});

// List employees with basic stats
router.get('/', async (_req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        attendance: true,
      },
    });

    const withStats = employees.map((e) => {
      const totalPresent = e.attendance.filter(
        (a) => a.status === 'PRESENT'
      ).length;
      const totalAbsent = e.attendance.filter(
        (a) => a.status === 'ABSENT'
      ).length;
      return {
        id: e.id,
        employeeCode: e.employeeCode,
        fullName: e.fullName,
        email: e.email,
        department: e.department,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        totalPresent,
        totalAbsent,
      };
    });

    res.json(withStats);
  } catch (err) {
    next(err);
  }
});

// Delete employee (and cascade attendance)
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const existing = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await prisma.employee.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

