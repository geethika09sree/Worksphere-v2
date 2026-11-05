
import React, { useMemo, useState } from "react";
import {
  Alert, Avatar, Box, Button, Card, CardContent, Chip,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, MenuItem, TextField, Typography, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress
} from "@mui/material";
import {
  useGetLeavesQuery,
  useApplyLeaveMutation,
  useReviewLeaveMutation,
} from "../redux/workforceApi";
import { useAuth } from "../context/AuthContext";

export default function Leaves() {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useGetLeavesQuery();
  const [applyLeave, { isLoading: applying }] = useApplyLeaveMutation();
  const [reviewLeave] = useReviewLeaveMutation();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    leaveType: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [message, setMessage] = useState("");

  const leaves = data?.leaves || [];
  const isAdmin = ["Admin", "HR"].includes(user?.role);

  const visibleLeaves = useMemo(() => {
    if (isAdmin) return leaves;
    return leaves.filter(
      (leave) => leave.employee?.employeeId === user?.employeeId
    );
  }, [leaves, isAdmin, user]);

  const countDays = (start, end) => {
    if (!start || !end) return 0;
    const a = new Date(start);
    const b = new Date(end);
    return Math.floor((b - a) / 86400000) + 1;
  };

  const submitLeave = async () => {
    setMessage("");

    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setMessage("Please fill all leave details.");
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setMessage("End date cannot be before start date.");
      return;
    }

    try {
      await applyLeave({
        ...form,
        ...(isAdmin ? {} : {}),
      }).unwrap();

      setMessage("Leave application submitted successfully.");
      setOpen(false);
      setForm({
        leaveType: "Casual",
        startDate: "",
        endDate: "",
        reason: "",
      });
    } catch (err) {
      setMessage(err?.data?.message || "Unable to submit leave.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await reviewLeave({ id, status }).unwrap();
      setMessage(`Leave ${status.toLowerCase()} successfully.`);
    } catch (err) {
      setMessage(err?.data?.message || "Unable to update leave.");
    }
  };

  const pending = visibleLeaves.filter((l) => l.status === "Pending").length;
  const approved = visibleLeaves.filter((l) => l.status === "Approved").length;
  const rejected = visibleLeaves.filter((l) => l.status === "Rejected").length;

  if (isLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <CircularProgress />
    </Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Leave Management</Typography>
          <Typography color="text.secondary">
            Apply for leave and track application status
          </Typography>
        </Box>

        <Button variant="contained" onClick={() => setOpen(true)}>
          Apply for Leave
        </Button>
      </Box>

      {message && <Alert severity={message.includes("successfully") ? "success" : "info"}
        sx={{ mb: 2 }} onClose={() => setMessage("")}>
        {message}
      </Alert>}

      {isError && <Alert severity="error" sx={{ mb: 2 }}>
        {error?.data?.message || "Failed to load leave applications."}
      </Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Applications", value: visibleLeaves.length },
          { label: "Pending", value: pending },
          { label: "Approved", value: approved },
          { label: "Rejected", value: rejected },
        ].map((item) => (
          <Grid item xs={6} md={3} key={item.label}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{item.label}</Typography>
                <Typography variant="h4" fontWeight={800}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Leave Applications
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  {["Employee", "Leave Type", "From", "To", "Days", "Reason", "Status",
                    ...(isAdmin ? ["Actions"] : [])].map((heading) => (
                    <TableCell key={heading}>
                      <b>{heading}</b>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleLeaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 8 : 7} align="center">
                      No leave applications found.
                    </TableCell>
                  </TableRow>
                ) : visibleLeaves.map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar>{leave.employee?.name?.[0] || "E"}</Avatar>
                        <Box>
                          <Typography fontWeight={600}>
                            {leave.employee?.name || "Employee"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {leave.employee?.employeeId || ""}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{countDays(leave.startDate, leave.endDate)}</TableCell>
                    <TableCell>{leave.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={leave.status}
                        color={
                          leave.status === "Approved" ? "success" :
                          leave.status === "Rejected" ? "error" : "warning"
                        }
                        size="small"
                      />
                    </TableCell>

                    {isAdmin && (
                      <TableCell>
                        {leave.status === "Pending" && (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button size="small" color="success"
                              onClick={() => updateStatus(leave._id, "Approved")}>
                              Approve
                            </Button>
                            <Button size="small" color="error"
                              onClick={() => updateStatus(leave._id, "Rejected")}>
                              Reject
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth margin="normal" label="Leave Type"
            value={form.leaveType}
            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
          >
            <MenuItem value="Casual">Casual Leave</MenuItem>
            <MenuItem value="Sick">Sick Leave</MenuItem>
            <MenuItem value="Earned">Earned Leave</MenuItem>
            <MenuItem value="Emergency">Emergency Leave</MenuItem>
          </TextField>

          <TextField fullWidth margin="normal" type="date" label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />

          <TextField fullWidth margin="normal" type="date" label="End Date"
            InputLabelProps={{ shrink: true }}
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />

          <TextField fullWidth multiline rows={3} margin="normal"
            label="Reason" value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitLeave} disabled={applying}>
            {applying ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
