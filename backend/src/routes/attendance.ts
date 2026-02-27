import { Router } from 'express';
import prisma from '../prisma';
import {
  attendanceQuerySchema,
  createAttendanceSchema,
} from '../validation';

const router = Router();

// Create / mark attendance
router.post('/', async (req, res, next) => {
  try {
    const parsed = createAttendanceSchema.parse({
      ...req.body,
      employeeId:
        typeof req.body.employeeId === 'string'
          ? Number(req.body.employeeId)
          : req.body.employeeId,
    });

    const employee = await prisma.employee.findUnique({
      where: { id: parsed.employeeId },
    });

    if (!employee) {
      return res
        .status(404)
        .json({ message: 'Employee not found for attendance' });
    }

    const date = new Date(parsed.date);
    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: parsed.employeeId,
        date,
        status: parsed.status,
      },
    });

    res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
});

// List attendance, optionally filtered by employee and date range
router.get('/', async (req, res, next) => {
  try {
    const parsed = attendanceQuerySchema.parse(req.query);

    const where: any = {};
    if (parsed.employeeId) {
      where.employeeId = parsed.employeeId;
    }

    if (parsed.from || parsed.to) {
      where.date = {};
      if (parsed.from) {
        const fromDate = new Date(parsed.from);
        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({ message: 'Invalid from date' });
        }
        where.date.gte = fromDate;
      }
      if (parsed.to) {
        const toDate = new Date(parsed.to);
        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({ message: 'Invalid to date' });
        }
        where.date.lte = toDate;
      }
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            department: true,
          },
        },
      },
    });

    res.json(records);
  } catch (err) {
    next(err);
  }
});

export default router;

