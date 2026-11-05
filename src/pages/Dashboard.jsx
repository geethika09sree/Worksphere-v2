
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";

import {
  People,
  AccessTime,
  EventAvailable,
  Apartment,
  Notifications,
  TrendingUp,
} from "@mui/icons-material";

import { useAuth } from "../context/AuthContext";
import UpcomingHolidays from "../components/UpcomingHolidays";

import {
  useGetEmployeesQuery,
  useGetAttendanceQuery,
  useGetLeavesQuery,
  useGetDepartmentsQuery,
} from "../redux/workforceApi";

function StatCard({ title, value, subtitle, icon, background, iconColor }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        height: "100%",
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 600, mb: 1 }}>
              {title}
            </Typography>

            <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#172033" }}>
              {value}
            </Typography>

            <Typography sx={{ fontSize: 11, color: "#94a3b8", mt: 0.7 }}>
              {subtitle}
            </Typography>
          </Box>

          <Avatar sx={{ width: 46, height: 46, background, color: iconColor }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

function getRecords(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function Dashboard() {
  const { user } = useAuth();
  const isEmployee = user?.role === "Employee";

  // Employee-only accessible data
  const attendanceQuery = useGetAttendanceQuery();
  const leavesQuery = useGetLeavesQuery();

  // Company-wide data: only fetch for Admin/HR
  const employeesQuery = useGetEmployeesQuery(undefined, {
    skip: isEmployee,
  });

  const departmentsQuery = useGetDepartmentsQuery(undefined, {
    skip: isEmployee,
  });

  const employees = getRecords(employeesQuery.data, ["employees"]);
  const attendance = getRecords(attendanceQuery.data, [
    "records",
    "attendance",
  ]);
  const leaves = getRecords(leavesQuery.data, ["leaves", "records"]);
  const departments = getRecords(departmentsQuery.data, ["departments"]);

  const today = new Date();

  const isToday = (value) => {
    if (!value) return false;

    const date = new Date(value);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const todayAttendance = attendance.filter((record) =>
    isToday(record.date || record.createdAt || record.checkIn)
  );

  const presentToday = todayAttendance.filter(
    (record) => record.status === "Present" || record.status === "Checked In"
  );

  const pendingLeaves = leaves.filter(
    (leave) => leave.status === "Pending"
  );

  const employeeAttendance = todayAttendance.find(
    (record) =>
      record.employeeId === user?.employeeId ||
      record.employee?.employeeId === user?.employeeId
  );

  const employeePendingLeaves = pendingLeaves.length;

  const activeEmployees = employees.filter(
    (employee) => !employee.status || employee.status === "Active"
  );

  const attendanceRate = activeEmployees.length
    ? Math.round((presentToday.length / activeEmployees.length) * 100)
    : 0;

  const loading =
    attendanceQuery.isLoading ||
    leavesQuery.isLoading ||
    (!isEmployee &&
      (employeesQuery.isLoading || departmentsQuery.isLoading));

  const error =
    attendanceQuery.isError ||
    leavesQuery.isError ||
    (!isEmployee &&
      (employeesQuery.isError || departmentsQuery.isError));

  if (loading) {
    return (
      <Box
        className="page-container"
        sx={{ display: "flex", justifyContent: "center", py: 8 }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="page-container">
        <Alert severity="error">
          Unable to load dashboard data. Check your backend server and API
          connection, then refresh the page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="page-container">
      {/* HEADER */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography className="page-title">
            Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
          </Typography>

          <Typography className="page-subtitle">
            {isEmployee
              ? "Here is your personal WorkSphere overview."
              : "Here is your company's live workforce overview."}
          </Typography>
        </Box>

        <Chip
          label={`${user?.role || "User"} Portal`}
          sx={{
            background: isEmployee ? "#E8EEFF" : "#F9E9EE",
            color: isEmployee ? "#1E3A8A" : "#800020",
            fontWeight: 700,
          }}
        />
      </Box>

      {/* EMPLOYEE DASHBOARD */}
      {isEmployee ? (
        <>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Today's Attendance"
                value={
                  employeeAttendance
                    ? employeeAttendance.status || "Present"
                    : "Not Marked"
                }
                subtitle="Your attendance status"
                icon={<AccessTime />}
                background="#E8EEFF"
                iconColor="#1E3A8A"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Leave Requests"
                value={employeePendingLeaves}
                subtitle="Pending requests"
                icon={<EventAvailable />}
                background="#F9E9EE"
                iconColor="#800020"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Attendance Records"
                value={attendance.length}
                subtitle="Records returned by your account"
                icon={<TrendingUp />}
                background="#E8EEFF"
                iconColor="#1E3A8A"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5} sx={{ mt: 0 }}>
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb", height: "100%" }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2 }}>
                    My WorkSphere Profile
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  {[
                    ["Employee Name", user?.name],
                    ["Employee ID", user?.employeeId || "Not linked"],
                    ["Email", user?.email],
                    ["Role", user?.role],
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ mb: 2 }}>
                      <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#172033" }}>
                        {value || "Not available"}
                      </Typography>
                    </Box>
                  ))}

                  <Chip
                    label="Account Active"
                    size="small"
                    sx={{
                      background: "#dcfce7",
                      color: "#166534",
                      fontWeight: 700,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb", height: "100%" }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Notifications sx={{ color: "#800020" }} />
                    <Typography sx={{ fontWeight: 700 }}>
                      Recent Updates
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    Welcome to WorkSphere
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.5, mb: 2 }}>
                    Your employee portal is ready.
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    Pending Leave Requests
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.5 }}>
                    You have {employeePendingLeaves} pending leave request(s).
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        /* ADMIN / HR DASHBOARD */
        <>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard
                title="Total Employees"
                value={activeEmployees.length}
                subtitle="Active workforce"
                icon={<People />}
                background="#E8EEFF"
                iconColor="#1E3A8A"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard
                title="Present Today"
                value={presentToday.length}
                subtitle="Today's attendance"
                icon={<AccessTime />}
                background="#E8EEFF"
                iconColor="#1E3A8A"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard
                title="Pending Leaves"
                value={pendingLeaves.length}
                subtitle="Awaiting approval"
                icon={<EventAvailable />}
                background="#F9E9EE"
                iconColor="#800020"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard
                title="Departments"
                value={departments.length}
                subtitle="Company departments"
                icon={<Apartment />}
                background="#E8EEFF"
                iconColor="#1E3A8A"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard
                title="Not Present"
                value={Math.max(activeEmployees.length - presentToday.length, 0)}
                subtitle="Based on today's records"
                icon={<People />}
                background="#F9E9EE"
                iconColor="#800020"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard
                title="Attendance Rate"
                value={`${attendanceRate}%`}
                subtitle="Of active employees"
                icon={<TrendingUp />}
                background="#E8EEFF"
                iconColor="#1E3A8A"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5} sx={{ mt: 0 }}>
            {/* TODAY'S ATTENDANCE */}
            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb" }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2 }}>
                    Today's Attendance
                  </Typography>

                  <Divider sx={{ mb: 1 }} />

                  {todayAttendance.length === 0 ? (
                    <Typography sx={{ py: 3, color: "#94a3b8", textAlign: "center" }}>
                      No attendance records found for today.
                    </Typography>
                  ) : (
                    todayAttendance.slice(0, 8).map((record) => {
                      const name =
                        record.employee?.name ||
                        record.employeeName ||
                        record.name ||
                        record.employeeId ||
                        "Employee";

                      const status = record.status || "Recorded";

                      return (
                        <Box
                          key={record._id || record.id || `${name}-${record.checkIn}`}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            py: 1.3,
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 34,
                                height: 34,
                                background: "#E8EEFF",
                                color: "#1E3A8A",
                                fontSize: 13,
                                fontWeight: 700,
                              }}
                            >
                              {String(name).charAt(0).toUpperCase()}
                            </Avatar>

                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                                {name}
                              </Typography>
                              <Typography sx={{ fontSize: 10, color: "#94a3b8" }}>
                                {record.checkIn
                                  ? `Check-in: ${new Date(record.checkIn).toLocaleTimeString()}`
                                  : "No check-in time"}
                              </Typography>
                            </Box>
                          </Box>

                          <Chip
                            label={status}
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 700,
                              background: status === "Present" || status === "Checked In"
                                ? "#dcfce7"
                                : "#fee2e2",
                              color: status === "Present" || status === "Checked In"
                                ? "#166534"
                                : "#991b1b",
                            }}
                          />
                        </Box>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* WORKFORCE OVERVIEW */}
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb", height: "100%" }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2 }}>
                    Workforce Overview
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                    Attendance Rate
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#1E3A8A", mb: 2 }}>
                    {attendanceRate}%
                  </Typography>

                  <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                    Employees Not Present
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#800020", mb: 2 }}>
                    {Math.max(activeEmployees.length - presentToday.length, 0)}
                  </Typography>

                  <Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
                    Pending Leave Requests
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#172033" }}>
                    {pendingLeaves.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      <Box sx={{ mt: 3 }}>
        <UpcomingHolidays />
      </Box>
    </Box>
  );
}

export default Dashboard;
