import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    'message' in err
  ) {
    const anyErr = err as { status?: number; message?: string };
    return res.status(anyErr.status || 500).json({
      message: anyErr.message || 'Something went wrong',
    });
  }

  return res.status(500).json({
    message: 'Internal server error',
  });
}

