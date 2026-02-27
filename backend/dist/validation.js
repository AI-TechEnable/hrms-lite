"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceQuerySchema = exports.createAttendanceSchema = exports.createEmployeeSchema = void 0;
const zod_1 = require("zod");
exports.createEmployeeSchema = zod_1.z.object({
    employeeCode: zod_1.z.string().min(1, 'Employee ID is required'),
    fullName: zod_1.z.string().min(1, 'Full name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    department: zod_1.z.string().min(1, 'Department is required'),
});
exports.createAttendanceSchema = zod_1.z.object({
    employeeId: zod_1.z.number().int().positive(),
    date: zod_1.z.string().min(1, 'Date is required'),
    status: zod_1.z.enum(['PRESENT', 'ABSENT']),
});
exports.attendanceQuerySchema = zod_1.z.object({
    employeeId: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : undefined))
        .refine((v) => (v === undefined ? true : Number.isInteger(v) && v > 0), {
        message: 'employeeId must be a positive integer',
    }),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
});
