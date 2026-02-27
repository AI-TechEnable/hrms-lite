"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, _req, res, _next) {
    console.error(err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            message: 'Validation error',
            errors: err.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            })),
        });
    }
    if (typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        'message' in err) {
        const anyErr = err;
        return res.status(anyErr.status || 500).json({
            message: anyErr.message || 'Something went wrong',
        });
    }
    return res.status(500).json({
        message: 'Internal server error',
    });
}
