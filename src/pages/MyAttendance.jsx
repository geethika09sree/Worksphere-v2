import React from "react";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  AccessTime,
  CheckCircle,
  EventAvailable,
} from "@mui/icons-material";

import { useGetAttendanceQuery } from "../redux/workforceApi";

const fmtDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "--");
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--";

export default function MyAttendance() {
  // The API already filters records to the logged-in employee
  const { data } = useGetAttendanceQuery();

  const attendance = (data?.records || []).map((record) => ({
    id: record._id,
    date: fmtDate(record.date),
    checkIn: record.checkIn ? fmtTime(record.checkIn) : null,
    method: "ID Scan",
    status: record.status,
  }));

  const todayRecord = attendance.find(
    (record) => record.date === fmtDate(new Date())
  );

  const presentDays = attendance.filter(
    (record) => record.status === "Present"
  ).length;

  const lastCheckIn = todayRecord?.checkIn || "--";

  return (
    <Box className="page-container">
      <Typography className="page-title">
        My Attendance
      </Typography>

      <Typography className="page-subtitle">
        Your attendance is recorded through the office ID
        scan system.
      </Typography>

      {/* TODAY STATUS */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card className="stat-card">
            <CardContent>
              <CheckCircle
                sx={{
                  color:
                    todayRecord?.status === "Present"
                      ? "green"
                      : "#800020",
                  mb: 1,
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Today's Status
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {todayRecord?.status ||
                  "Not Logged In"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="stat-card">
            <CardContent>
              <AccessTime
                sx={{
                  color: "#1E3A8A",
                  mb: 1,
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Today's Check-In
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {lastCheckIn}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="stat-card">
            <CardContent>
              <EventAvailable
                sx={{
                  color: "#800020",
                  mb: 1,
                }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Recorded Present Days
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ mt: 0.5 }}
              >
                {presentDays}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* INFORMATION */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          backgroundColor: "#E8EEFF",
        }}
      >
        <CardContent>
          <Typography
            fontWeight={700}
            sx={{ color: "#1E3A8A", mb: 0.5 }}
          >
            How attendance works
          </Typography>

          <Typography variant="body2">
            Your attendance is automatically recorded when
            your employee ID is scanned at the office.
            Employees do not manually mark themselves
            present in this system.
          </Typography>
        </CardContent>
      </Card>

      {/* HISTORY */}
      <Card className="table-container">
        <CardContent>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 2 }}
          >
            Attendance History
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Check-In</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.date}
                    </TableCell>

                    <TableCell>
                      {record.checkIn || "--"}
                    </TableCell>

                    <TableCell>
                      {record.method || "ID Scan"}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={record.status}
                        size="small"
                        color={
                          record.status === "Present"
                            ? "success"
                            : "default"
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {attendance.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                    >
                      No attendance records yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
