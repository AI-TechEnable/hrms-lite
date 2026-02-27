import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import employeesRouter from './routes/employees';
import attendanceRouter from './routes/attendance';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: ORIGIN,
  })
);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/employees', employeesRouter);
app.use('/api/attendance', attendanceRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HRMS Lite API listening on port ${PORT}`);
});

