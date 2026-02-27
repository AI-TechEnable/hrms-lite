"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const validation_1 = require("../validation");
const router = (0, express_1.Router)();
// Create / mark attendance
router.post('/', async (req, res, next) => {
    try {
        const parsed = validation_1.createAttendanceSchema.parse({
            ...req.body,
            employeeId: typeof req.body.employeeId === 'string'
                ? Number(req.body.employeeId)
                : req.body.employeeId,
        });
        const employee = await prisma_1.default.employee.findUnique({
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
        const attendance = await prisma_1.default.attendance.create({
            data: {
                employeeId: parsed.employeeId,
                date,
                status: parsed.status,
            },
        });
        res.status(201).json(attendance);
    }
    catch (err) {
        next(err);
    }
});
// List attendance, optionally filtered by employee and date range
router.get('/', async (req, res, next) => {
    try {
        const parsed = validation_1.attendanceQuerySchema.parse(req.query);
        const where = {};
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
        const records = await prisma_1.default.attendance.findMany({
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
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
