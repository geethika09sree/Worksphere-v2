
import React, { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  AccessTime,
  CheckCircle,
  Fingerprint,
  Person,
  People,
  QrCodeScanner,
  Logout,
} from "@mui/icons-material";

import { useAuth } from "../context/AuthContext";

import {
  useGetEmployeesQuery,
  useGetAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,
} from "../redux/workforceApi";

function formatTime(value) {
  if (!value) return "--";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(value) {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function getError(error) {
  return (
    error?.data?.message ||
    error?.error ||
    "Something went wrong. Please try again."
  );
}

export default function Attendance() {
  const { user } = useAuth();

  const isEmployee = user?.role === "Employee";

  const [scanId, setScanId] = useState("");
  const [message, setMessage] = useState(null);

  const {
    data: employeeData,
    isLoading: employeesLoading,
  } = useGetEmployeesQuery(undefined, {
    skip: isEmployee,
  });

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    isError,
    error,
  } = useGetAttendanceQuery();

  const [checkIn, { isLoading: checkingIn }] =
    useCheckInMutation();

  const [checkOut, { isLoading: checkingOut }] =
    useCheckOutMutation();

  const employees = Array.isArray(employeeData)
    ? employeeData
    : employeeData?.employees || [];

  const records = attendanceData?.records || [];

  const todayRecords = useMemo(
    () => records.filter((record) => isToday(record.date)),
    [records]
  );

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  );

  const loggedIn = todayRecords.filter(
    (record) => record.checkIn
  ).length;

  const notLoggedIn = Math.max(
    0,
    activeEmployees.length - loggedIn
  );

  const attendanceRate =
    activeEmployees.length > 0
      ? Math.round(
          (loggedIn / activeEmployees.length) * 100
        )
      : 0;

  async function handleCheckIn(employeeId = "") {
    if (!isEmployee && !employeeId.trim()) {
      setMessage({
        type: "warning",
        text: "Enter an Employee ID first.",
      });
      return;
    }

    try {
      const payload = isEmployee ? {} : {
        employeeId: employeeId.trim(),
      };

      const result = await checkIn(payload).unwrap();

      setMessage({
        type: "success",
        text: result.message || "Check-in successful!",
      });

      setScanId("");
    } catch (err) {
      setMessage({
        type: "error",
        text: getError(err),
      });
    }
  }

  async function handleCheckOut(employeeId = "") {
    try {
      const payload = isEmployee ? {} : {
        employeeId,
      };

      const result = await checkOut(payload).unwrap();

      setMessage({
        type: "success",
        text: result.message || "Check-out successful!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: getError(err),
      });
    }
  }

  const currentEmployeeRecord = todayRecords.find(
    (record) =>
      record.employee?.employeeId === user?.employeeId
  );

  const currentEmployeeCheckedIn =
    Boolean(currentEmployeeRecord?.checkIn);

  const currentEmployeeCheckedOut =
    Boolean(currentEmployeeRecord?.checkOut);

  const busy = checkingIn || checkingOut;

  const displayRecords = isEmployee
    ? records
    : todayRecords;

  return (
    <Box className="page-container">
      <Typography className="page-title">
        Attendance Management
      </Typography>

      <Typography className="page-subtitle">
        Manage employee check-in, check-out and attendance history.
      </Typography>

      {message && (
        <Alert
          severity={message.type}
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getError(error)}
        </Alert>
      )}

      {/* EMPLOYEE SELF ATTENDANCE */}
      {isEmployee && (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              My Attendance
            </Typography>

            <Typography color="text.secondary" mb={2}>
              Welcome, {user?.name || "Employee"}.
              Mark your attendance below.
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap">
              {!currentEmployeeCheckedIn && (
                <Button
                  variant="contained"
                  startIcon={<Fingerprint />}
                  disabled={busy || attendanceLoading}
                  onClick={() => handleCheckIn()}
                  sx={{ backgroundColor: "#1E3A8A" }}
                >
                  Check In
                </Button>
              )}

              {currentEmployeeCheckedIn &&
                !currentEmployeeCheckedOut && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Logout />}
                    disabled={busy}
                    onClick={() => handleCheckOut()}
                  >
                    Check Out
                  </Button>
                )}

              {currentEmployeeCheckedOut && (
                <Chip
                  color="success"
                  label="Attendance completed for today"
                />
              )}
            </Box>

            {currentEmployeeCheckedIn && (
              <Typography mt={2} variant="body2">
                Check-in: {formatTime(currentEmployeeRecord.checkIn)}
                {" | "}
                Check-out: {formatTime(currentEmployeeRecord.checkOut)}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* ADMIN / HR ID SCANNER */}
      {!isEmployee && (
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <QrCodeScanner sx={{ color: "#1E3A8A" }} />

              <Typography variant="h6" fontWeight={700}>
                Employee ID Scanner
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              mb={2}
            >
              Enter the complete Employee ID, for example EMP-001.
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                label="Employee ID"
                placeholder="EMP-001"
                value={scanId}
                onChange={(e) => setScanId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCheckIn(scanId);
                  }
                }}
                sx={{ minWidth: 280 }}
              />

              <Button
                variant="contained"
                startIcon={<Fingerprint />}
                disabled={busy}
                onClick={() => handleCheckIn(scanId)}
                sx={{
                  backgroundColor: "#1E3A8A",
                  px: 3,
                }}
              >
                Check In
              </Button>

              <Button
                variant="outlined"
                startIcon={<Logout />}
                disabled={busy || !scanId.trim()}
                onClick={() => handleCheckOut(scanId.trim())}
              >
                Check Out
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* SUMMARY */}
      {!isEmployee && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            {
              title: "Total Employees",
              value: employeesLoading ? "..." : activeEmployees.length,
              icon: <People sx={{ color: "#1E3A8A" }} />,
            },
            {
              title: "Logged In",
              value: loggedIn,
              icon: <CheckCircle sx={{ color: "green" }} />,
            },
            {
              title: "Not Logged In",
              value: notLoggedIn,
              icon: <Person sx={{ color: "#800020" }} />,
            },
            {
              title: "Attendance Rate",
              value: `${attendanceRate}%`,
              icon: <AccessTime sx={{ color: "#1E3A8A" }} />,
            },
          ].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Card className="stat-card">
                <CardContent>
                  {item.icon}

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={1}
                  >
                    {item.title}
                  </Typography>

                  <Typography variant="h4" fontWeight={700}>
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ATTENDANCE TABLE */}
      <Card className="table-container">
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            flexWrap="wrap"
            gap={1}
          >
            <Typography variant="h6" fontWeight={700}>
              {isEmployee ? "My Attendance History" : "Today's Attendance"}
            </Typography>

            <Chip
              label={new Date().toLocaleDateString("en-IN")}
              sx={{
                backgroundColor: "#E8EEFF",
                color: "#1E3A8A",
                fontWeight: 600,
              }}
            />
          </Box>

          {attendanceLoading ? (
            <Typography>Loading attendance...</Typography>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {displayRecords.map((record) => {
                    const employee = record.employee || {};

                    return (
                      <TableRow key={record._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar
                              sx={{
                                backgroundColor: "#E8EEFF",
                                color: "#1E3A8A",
                              }}
                            >
                              {(employee.name || "E")
                                .charAt(0)
                                .toUpperCase()}
                            </Avatar>

                            <Typography fontWeight={600}>
                              {employee.name || "Employee"}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          {employee.employeeId || "--"}
                        </TableCell>

                        <TableCell>
                          {employee.department || "--"}
                        </TableCell>

                        <TableCell>
                          {record.date
                            ? new Date(record.date).toLocaleDateString("en-IN")
                            : "--"}
                        </TableCell>

                        <TableCell>
                          {formatTime(record.checkIn)}
                        </TableCell>

                        <TableCell>
                          {formatTime(record.checkOut)}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={record.status || "Present"}
                            size="small"
                            color={
                              record.status === "Present"
                                ? "success"
                                : "default"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {displayRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No attendance records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* QUICK DEMO SCAN */}
      {!isEmployee && (
        <Card sx={{ mt: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Quick Demo Scan
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mb={2}
            >
              Select an active employee to record their check-in.
            </Typography>

            <Box display="flex" gap={1} flexWrap="wrap">
              {activeEmployees.map((employee) => (
                <Button
                  key={employee._id}
                  variant="outlined"
                  disabled={busy}
                  onClick={() => handleCheckIn(employee.employeeId)}
                >
                  {employee.employeeId}
                </Button>
              ))}

              {activeEmployees.length === 0 && (
                <Typography color="text.secondary">
                  No active employees found.
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

