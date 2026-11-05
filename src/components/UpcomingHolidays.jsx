import React from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { Celebration } from "@mui/icons-material";

import { useGetHolidaysQuery } from "../redux/workforceApi";

// Public holidays from a third-party API (Nager.Date), fetched through our backend.
export default function UpcomingHolidays({ country = "IN", limit = 5 }) {
  const year = new Date().getFullYear();

  // Current year plus next year, so the list isn't empty in December
  const current = useGetHolidaysQuery({ year, country });
  const next = useGetHolidaysQuery({ year: year + 1, country });

  const todayKey = new Date().toISOString().split("T")[0];

  const upcoming = [
    ...(current.data?.holidays || []),
    ...(next.data?.holidays || []),
  ]
    .filter((holiday) => holiday.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);

  const isLoading = current.isLoading || next.isLoading;
  const failed = current.isError && next.isError;

  return (
    <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Celebration sx={{ color: "#800020" }} />
          <Typography sx={{ fontWeight: 700 }}>Upcoming Holidays</Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {isLoading && <CircularProgress size={22} />}

        {failed && (
          <Alert severity="info">Holiday calendar is currently unavailable.</Alert>
        )}

        {!isLoading && !failed && upcoming.length === 0 && (
          <Typography sx={{ fontSize: 12, color: "#64748b" }}>
            No upcoming holidays found.
          </Typography>
        )}

        {upcoming.map((holiday) => (
          <Box
            key={`${holiday.date}-${holiday.name}`}
            sx={{ display: "flex", justifyContent: "space-between", py: 0.8 }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {holiday.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#64748b" }}>
              {new Date(`${holiday.date}T00:00:00`).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                weekday: "short",
              })}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}
