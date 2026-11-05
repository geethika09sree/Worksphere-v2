import React from "react";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";

import {
  Email,
  Badge,
  Work,
  Business,
} from "@mui/icons-material";

import { useGetMyEmployeeQuery } from "../redux/workforceApi";

export default function MyProfile() {
  const { data } = useGetMyEmployeeQuery();

  const employee = data
    ? {
        ...data,
        id: data.employeeId,
        joiningDate: data.joiningDate
          ? new Date(data.joiningDate).toISOString().split("T")[0]
          : "--",
      }
    : null;

  if (!employee) {
    return (
      <Box className="page-container">
        <Typography className="page-title">
          My Profile
        </Typography>

        <Typography color="text.secondary">
          Employee profile not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="page-container">

      <Typography className="page-title">
        My Profile
      </Typography>

      <Typography className="page-subtitle">
        View your personal and employment information.
      </Typography>

      <Card sx={{ mb: 3 }}>

        <CardContent>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >

            <Avatar
              sx={{
                width: 90,
                height: 90,
                bgcolor: "#1e3a8a",
                fontSize: 32,
              }}
            >
              {employee.name.charAt(0)}
            </Avatar>

            <Box>

              <Typography
                variant="h4"
                fontWeight={800}
              >
                {employee.name}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {employee.designation}
              </Typography>

              <Chip
                label={employee.status}
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />

            </Box>

          </Box>

        </CardContent>

      </Card>

      <Grid container spacing={3}>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>

              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 3 }}
              >
                Personal Information
              </Typography>

              <InfoRow
                icon={<Badge />}
                label="Employee ID"
                value={`EMP-${String(
                  employee.id
                ).padStart(3, "0")}`}
              />

              <InfoRow
                icon={<Email />}
                label="Email"
                value={employee.email}
              />

              <InfoRow
                icon={<Work />}
                label="Designation"
                value={employee.designation}
              />

            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>

              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 3 }}
              >
                Employment Information
              </Typography>

              <InfoRow
                icon={<Business />}
                label="Department"
                value={employee.department}
              />

              <InfoRow
                icon={<Work />}
                label="Joining Date"
                value={employee.joiningDate}
              />

              <InfoRow
                icon={<Badge />}
                label="Employment Status"
                value={employee.status}
              />

            </CardContent>
          </Card>
        </Grid>

      </Grid>

    </Box>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 2.5,
        alignItems: "center",
      }}
    >

      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e8eeff",
          color: "#1e3a8a",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          {label}
        </Typography>

        <Typography fontWeight={600}>
          {value}
        </Typography>
      </Box>

    </Box>
  );
}
