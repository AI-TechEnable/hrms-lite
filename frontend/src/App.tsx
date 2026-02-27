import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

type Employee = {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  totalPresent?: number;
  totalAbsent?: number;
};

type AttendanceRecord = {
  id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT';
  employeeId: number;
  employee?: {
    id: number;
    employeeCode: string;
    fullName: string;
    department: string;
  };
};

type EmployeeFormState = {
  employeeCode: string;
  fullName: string;
  email: string;
  department: string;
};

type AttendanceFormState = {
  employeeId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT';
};

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [employeeForm, setEmployeeForm] = useState<EmployeeFormState>({
    employeeCode: '',
    fullName: '',
    email: '',
    department: '',
  });

  const [attendanceForm, setAttendanceForm] =
    useState<AttendanceFormState>({
      employeeId: '',
      date: new Date().toISOString().slice(0, 10),
      status: 'PRESENT',
    });

  const [filters, setFilters] = useState<{
    employeeId: string;
    from: string;
    to: string;
  }>({
    employeeId: '',
    from: '',
    to: '',
  });

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [submittingEmployee, setSubmittingEmployee] = useState(false);
  const [submittingAttendance, setSubmittingAttendance] =
    useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (e) => String(e.id) === attendanceForm.employeeId
      ) || null,
    [employees, attendanceForm.employeeId]
  );

  async function fetchEmployees() {
    try {
      setLoadingEmployees(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/employees`);
      if (!res.ok) {
        throw new Error('Failed to load employees');
      }
      const data = (await res.json()) as Employee[];
      setEmployees(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Failed to load employees'
      );
    } finally {
      setLoadingEmployees(false);
    }
  }

  async function fetchAttendance(params?: {
    employeeId?: string;
    from?: string;
    to?: string;
  }) {
    try {
      setLoadingAttendance(true);
      setError(null);

      const searchParams = new URLSearchParams();
      const all = params || filters;
      if (all.employeeId) searchParams.set('employeeId', all.employeeId);
      if (all.from) searchParams.set('from', all.from);
      if (all.to) searchParams.set('to', all.to);

      const query = searchParams.toString();
      const url = query
        ? `${API_BASE}/api/attendance?${query}`
        : `${API_BASE}/api/attendance`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to load attendance');
      }
      const data = (await res.json()) as AttendanceRecord[];
      setAttendance(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load attendance records'
      );
    } finally {
      setLoadingAttendance(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleEmployeeSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    try {
      setSubmittingEmployee(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.message ||
          body?.errors?.[0]?.message ||
          'Failed to create employee';
        throw new Error(message);
      }

      setEmployeeForm({
        employeeCode: '',
        fullName: '',
        email: '',
        department: '',
      });
      await fetchEmployees();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create employee'
      );
    } finally {
      setSubmittingEmployee(false);
    }
  }

  async function handleDeleteEmployee(id: number) {
    if (
      !window.confirm(
        'Are you sure you want to delete this employee? This will also remove their attendance records.'
      )
    ) {
      return;
    }

    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/employees/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null);
        const message =
          body?.message || 'Failed to delete employee record';
        throw new Error(message);
      }
      await fetchEmployees();
      await fetchAttendance();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete employee'
      );
    }
  }

  async function handleAttendanceSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (!attendanceForm.employeeId) {
      setError('Please select an employee for attendance');
      return;
    }

    try {
      setSubmittingAttendance(true);
      setError(null);

      const payload = {
        employeeId: Number(attendanceForm.employeeId),
        date: attendanceForm.date,
        status: attendanceForm.status,
      };

      const res = await fetch(`${API_BASE}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.message ||
          body?.errors?.[0]?.message ||
          'Failed to mark attendance';
        throw new Error(message);
      }

      await fetchAttendance();
      await fetchEmployees(); // refresh summary counts
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to mark attendance'
      );
    } finally {
      setSubmittingAttendance(false);
    }
  }

  const totalEmployees = employees.length;
  const totalPresent = employees.reduce(
    (sum, e) => sum + (e.totalPresent || 0),
    0
  );
  const totalAbsent = employees.reduce(
    (sum, e) => sum + (e.totalAbsent || 0),
    0
  );

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>HRMS Lite</h1>
          <p className="subtitle">
            Lightweight HR management for employees and attendance.
          </p>
        </div>
        <div className="header-tag">
          <span className="dot" />
          <span>Admin Console</span>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="summary-grid">
        <div className="summary-card">
          <h3>Total Employees</h3>
          <p className="summary-value">{totalEmployees}</p>
        </div>
        <div className="summary-card">
          <h3>Total Present Days</h3>
          <p className="summary-value">{totalPresent}</p>
        </div>
        <div className="summary-card">
          <h3>Total Absent Days</h3>
          <p className="summary-value">{totalAbsent}</p>
        </div>
      </section>

      <main className="layout">
        <section className="panel">
          <h2>Employee Management</h2>
          <p className="panel-subtitle">
            Add, view, and delete employee records.
          </p>

          <form
            className="form-grid"
            onSubmit={handleEmployeeSubmit}
            autoComplete="off"
          >
            <div className="form-field">
              <label htmlFor="employeeCode">Employee ID</label>
              <input
                id="employeeCode"
                type="text"
                value={employeeForm.employeeCode}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    employeeCode: e.target.value,
                  }))
                }
                required
                placeholder="EMP001"
              />
            </div>
            <div className="form-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={employeeForm.fullName}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                required
                placeholder="Jane Doe"
              />
            </div>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={employeeForm.email}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                required
                placeholder="jane.doe@example.com"
              />
            </div>
            <div className="form-field">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                type="text"
                value={employeeForm.department}
                onChange={(e) =>
                  setEmployeeForm((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                required
                placeholder="Engineering / HR / Finance"
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                disabled={submittingEmployee}
              >
                {submittingEmployee ? 'Saving...' : 'Add Employee'}
              </button>
            </div>
          </form>

          <div className="table-wrapper">
            {loadingEmployees ? (
              <p className="muted">Loading employees...</p>
            ) : employees.length === 0 ? (
              <p className="muted">
                No employees yet. Add your first employee above.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Present Days</th>
                    <th>Absent Days</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.employeeCode}</td>
                      <td>{employee.fullName}</td>
                      <td>{employee.email}</td>
                      <td>{employee.department}</td>
                      <td>{employee.totalPresent ?? 0}</td>
                      <td>{employee.totalAbsent ?? 0}</td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() =>
                            handleDeleteEmployee(employee.id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="panel">
          <h2>Attendance Management</h2>
          <p className="panel-subtitle">
            Mark daily attendance and review records.
          </p>

          <form
            className="form-grid"
            onSubmit={handleAttendanceSubmit}
          >
            <div className="form-field">
              <label htmlFor="attendanceEmployee">Employee</label>
              <select
                id="attendanceEmployee"
                value={attendanceForm.employeeId}
                onChange={(e) =>
                  setAttendanceForm((prev) => ({
                    ...prev,
                    employeeId: e.target.value,
                  }))
                }
                required
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.fullName} ({employee.employeeCode})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="attendanceDate">Date</label>
              <input
                id="attendanceDate"
                type="date"
                value={attendanceForm.date}
                onChange={(e) =>
                  setAttendanceForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="attendanceStatus">Status</label>
              <select
                id="attendanceStatus"
                value={attendanceForm.status}
                onChange={(e) =>
                  setAttendanceForm((prev) => ({
                    ...prev,
                    status: e.target.value as
                      | 'PRESENT'
                      | 'ABSENT',
                  }))
                }
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                disabled={submittingAttendance}
              >
                {submittingAttendance
                  ? 'Saving...'
                  : 'Mark Attendance'}
              </button>
            </div>
          </form>

          <div className="filters-row">
            <div className="form-field">
              <label htmlFor="filterEmployee">Filter by employee</label>
              <select
                id="filterEmployee"
                value={filters.employeeId}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    employeeId: value,
                  }));
                  fetchAttendance({
                    ...filters,
                    employeeId: value,
                  });
                }}
              >
                <option value="">All employees</option>
                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.fullName} ({employee.employeeCode})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field inline">
              <label htmlFor="fromDate">From</label>
              <input
                id="fromDate"
                type="date"
                value={filters.from}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    from: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-field inline">
              <label htmlFor="toDate">To</label>
              <input
                id="toDate"
                type="date"
                value={filters.to}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    to: e.target.value,
                  }))
                }
              />
            </div>
            <div className="filters-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  fetchAttendance(filters);
                }}
              >
                Apply Filters
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  const cleared = {
                    employeeId: '',
                    from: '',
                    to: '',
                  };
                  setFilters(cleared);
                  fetchAttendance(cleared);
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            {loadingAttendance ? (
              <p className="muted">Loading attendance...</p>
            ) : attendance.length === 0 ? (
              <p className="muted">
                No attendance records found for the selected filters.
              </p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Employee</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => {
                    const employee =
                      record.employee ||
                      employees.find(
                        (e) => e.id === record.employeeId
                      );
                    const date = new Date(record.date)
                      .toISOString()
                      .slice(0, 10);
                    return (
                      <tr key={record.id}>
                        <td>{date}</td>
                        <td>
                          <span
                            className={
                              record.status === 'PRESENT'
                                ? 'badge badge-success'
                                : 'badge badge-danger'
                            }
                          >
                            {record.status === 'PRESENT'
                              ? 'Present'
                              : 'Absent'}
                          </span>
                        </td>
                        <td>
                          {employee
                            ? `${employee.fullName} (${employee.employeeCode})`
                            : '—'}
                        </td>
                        <td>{employee?.department ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {selectedEmployee && (
            <div className="detail-card">
              <h3>Selected Employee</h3>
              <p>
                <strong>
                  {selectedEmployee.fullName} (
                    {selectedEmployee.employeeCode}
                  )
                </strong>
              </p>
              <p>{selectedEmployee.email}</p>
              <p>{selectedEmployee.department}</p>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <span>HRMS Lite • Internal Admin Tool</span>
      </footer>
    </div>
  );
}

export default App;
