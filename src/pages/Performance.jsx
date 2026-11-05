
import React, { useState } from "react";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  MenuItem, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Alert, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  useGetPerformanceQuery,
  useAddPerformanceMutation,
  useUpdatePerformanceMutation,
  useDeletePerformanceMutation,
  useGetEmployeesQuery,
} from "../redux/workforceApi";

const emptyForm = {
  employee: "",
  reviewPeriod: "",
  rating: 3,
  goals: "",
  achievements: "",
  feedback: "",
};

export default function Performance() {
  const { data, isLoading, isError } = useGetPerformanceQuery();
  const { data: employeeData } = useGetEmployeesQuery();

  const [addPerformance, { isLoading: adding }] = useAddPerformanceMutation();
  const [updatePerformance] = useUpdatePerformanceMutation();
  const [deletePerformance] = useDeletePerformanceMutation();

  const records = data?.records || [];
  const employees = employeeData?.employees || [];

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const change = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record._id);
    setForm({
      employee: record.employee?._id || "",
      reviewPeriod: record.reviewPeriod || "",
      rating: record.rating ?? 3,
      goals: record.goals || "",
      achievements: record.achievements || "",
      feedback: record.feedback || "",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.employee || !form.reviewPeriod || form.rating === "") {
      setMessage("Please complete employee, review period and rating.");
      return;
    }

    try {
      const payload = {
        ...form,
        rating: Number(form.rating),
      };

      if (editingId) {
        await updatePerformance({ id: editingId, ...payload }).unwrap();
        setMessage("Performance review updated successfully.");
      } else {
        await addPerformance(payload).unwrap();
        setMessage("Performance review added successfully.");
      }

      setOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      setMessage(err?.data?.message || "Unable to save performance review.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this performance review?")) return;

    try {
      await deletePerformance(id).unwrap();
      setMessage("Performance review deleted.");
    } catch (err) {
      setMessage(err?.data?.message || "Unable to delete review.");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Performance Management
          </Typography>
          <Typography color="text.secondary">
            Manage employee reviews, ratings and achievements
          </Typography>
        </Box>
        <Button variant="contained" onClick={openAdd}>
          Add Review
        </Button>
      </Box>

      {message && (
        <Alert severity={message.includes("successfully") || message.includes("deleted") ? "success" : "info"}
          sx={{ mb: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {isError && <Alert severity="error">Failed to load performance records.</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ["Total Reviews", records.length],
          ["Average Rating", records.length
            ? (records.reduce((sum, r) => sum + Number(r.rating || 0), 0) / records.length).toFixed(1)
            : "0"],
          ["Employees Reviewed", new Set(records.map(r => r.employee?._id).filter(Boolean)).size],
        ].map(([label, value]) => (
          <Grid item xs={12} sm={4} key={label}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{label}</Typography>
                <Typography variant="h4" fontWeight={800}>{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Employee Performance Reviews
          </Typography>

          {isLoading ? (
            <Typography>Loading reviews...</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    {["Employee", "Review Period", "Rating", "Goals",
                      "Achievements", "Feedback", "Actions"].map(h => (
                      <TableCell key={h}><b>{h}</b></TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No performance reviews found.
                      </TableCell>
                    </TableRow>
                  ) : records.map(record => (
                    <TableRow key={record._id}>
                      <TableCell>
                        <b>{record.employee?.name || "Employee"}</b>
                        <Typography variant="caption" display="block">
                          {record.employee?.employeeId || ""}
                        </Typography>
                      </TableCell>
                      <TableCell>{record.reviewPeriod}</TableCell>
                      <TableCell>
                        <Chip label={`${record.rating}/5`} color="primary" />
                      </TableCell>
                      <TableCell>{record.goals || "-"}</TableCell>
                      <TableCell>{record.achievements || "-"}</TableCell>
                      <TableCell>{record.feedback || "-"}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => openEdit(record)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => remove(record._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit Review" : "Add Performance Review"}</DialogTitle>
        <DialogContent>
          <TextField select fullWidth margin="normal" label="Employee"
            name="employee" value={form.employee} onChange={change}>
            {employees.map(emp => (
              <MenuItem key={emp._id} value={emp._id}>
                {emp.name} ({emp.employeeId})
              </MenuItem>
            ))}
          </TextField>

          <TextField fullWidth margin="normal" label="Review Period"
            name="reviewPeriod" placeholder="e.g. October 2026"
            value={form.reviewPeriod} onChange={change} />

          <TextField select fullWidth margin="normal" label="Rating"
            name="rating" value={form.rating} onChange={change}>
            {[1, 2, 3, 4, 5].map(n => (
              <MenuItem key={n} value={n}>{n} / 5</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth multiline rows={2} margin="normal"
            label="Goals" name="goals" value={form.goals} onChange={change} />

          <TextField fullWidth multiline rows={2} margin="normal"
            label="Achievements" name="achievements"
            value={form.achievements} onChange={change} />

          <TextField fullWidth multiline rows={2} margin="normal"
            label="Feedback" name="feedback"
            value={form.feedback} onChange={change} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={adding}>
            {adding ? "Saving..." : "Save Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
