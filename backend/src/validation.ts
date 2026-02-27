import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employeeCode: z.string().min(1, 'Employee ID is required'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  department: z.string().min(1, 'Department is required'),
});

export const createAttendanceSchema = z.object({
  employeeId: z.number().int().positive(),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['PRESENT', 'ABSENT']),
});

export const attendanceQuerySchema = z.object({
  employeeId: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => (v === undefined ? true : Number.isInteger(v) && v > 0), {
      message: 'employeeId must be a positive integer',
    }),
  from: z.string().optional(),
  to: z.string().optional(),
});

