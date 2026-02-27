"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const validation_1 = require("../validation");
const router = (0, express_1.Router)();
// Create employee
router.post('/', async (req, res, next) => {
    try {
        const parsed = validation_1.createEmployeeSchema.parse(req.body);
        const existing = await prisma_1.default.employee.findFirst({
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
        const employee = await prisma_1.default.employee.create({
            data: parsed,
        });
        res.status(201).json(employee);
    }
    catch (err) {
        next(err);
    }
});
// List employees with basic stats
router.get('/', async (_req, res, next) => {
    try {
        const employees = await prisma_1.default.employee.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                attendance: true,
            },
        });
        const withStats = employees.map((e) => {
            const totalPresent = e.attendance.filter((a) => a.status === 'PRESENT').length;
            const totalAbsent = e.attendance.filter((a) => a.status === 'ABSENT').length;
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
    }
    catch (err) {
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
        const existing = await prisma_1.default.employee.findUnique({
            where: { id },
        });
        if (!existing) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        await prisma_1.default.employee.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
