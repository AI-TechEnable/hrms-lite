"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const employees_1 = __importDefault(require("./routes/employees"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';
app.use((0, cors_1.default)({
    origin: ORIGIN,
}));
app.use(express_1.default.json());
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/employees', employees_1.default);
app.use('/api/attendance', attendance_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`HRMS Lite API listening on port ${PORT}`);
});
