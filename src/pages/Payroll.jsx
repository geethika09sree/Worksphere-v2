
import React, { useState } from "react";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  MenuItem, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {
  useGetPayrollQuery,
  useCreatePayrollMutation,
  useUpdatePayrollStatusMutation,
  useGetEmployeesQuery,
} from "../redux/workforceApi";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const initialForm = {
  employee: "",
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  basicSalary: "",
  allowances: 0,
  deductions: 0,
};

export default function Payroll() {
  const { data, isLoading, isError } = useGetPayrollQuery();
  const { data: employeeData } = useGetEmployeesQuery();

  const [createPayroll, { isLoading: creating }] = useCreatePayrollMutation();
  const [updateStatus] = useUpdatePayrollStatusMutation();

  const records = data?.records || [];
  const employees = employeeData?.employees || [];

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const change = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const netSalary =
    Number(form.basicSalary || 0) +
    Number(form.allowances || 0) -
    Number(form.deductions || 0);

  const submit = async () => {
    if (!form.employee || form.basicSalary === "") {
      setMessage("Please select an employee and enter basic salary.");
      return;
    }

    if (netSalary < 0) {
      setMessage("Deductions cannot exceed total salary.");
      return;
    }

    try {
      await createPayroll({
        ...form,
        month: Number(form.month),
        year: Number(form.year),
        basicSalary: Number(form.basicSalary),
        allowances: Number(form.allowances),
        deductions: Number(form.deductions),
      }).unwrap();

      setMessage("Payroll created successfully.");
      setOpen(false);
      setForm(initialForm);
    } catch (err) {
      setMessage(err?.data?.message || "Unable to create payroll. Check for duplicate month records.");
    }
  };

  const markPaid = async (id) => {
    try {
      await updateStatus({ id, status: "Paid" }).unwrap();
      setMessage("Payroll marked as paid.");
    } catch (err) {
      setMessage(err?.data?.message || "Unable to update payment status.");
    }
  };

  const totalPayroll = records.reduce((sum, r) => sum + Number(r.netSalary || 0), 0);
  const paidTotal = records
    .filter(r => r.status === "Paid")
    .reduce((sum, r) => sum + Number(r.netSalary || 0), 0);
  const pendingTotal = totalPayroll - paidTotal;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Payroll Management</Typography>
          <Typography color="text.secondary">
            Manage employee salaries and payment records
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Generate Payroll
        </Button>
      </Box>

      {message && (
        <Alert severity={message.includes("successfully") || message.includes("paid") ? "success" : "info"}
          sx={{ mb: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {isError && <Alert severity="error">Failed to load payroll records.</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ["Total Payroll", totalPayroll],
          ["Paid Amount", paidTotal],
          ["Pending Amount", pendingTotal],
          ["Payroll Records", records.length],
        ].map(([label, value]) => (
          <Grid item xs={6} md={3} key={label}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{label}</Typography>
                <Typography variant="h5" fontWeight={800}>
                  {label === "Payroll Records"
                    ? value
                    : `₹${Number(value).toLocaleString("en-IN")}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Payroll Records
          </Typography>

          {isLoading ? (
            <Typography>Loading payroll...</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    {["Employee", "Month", "Basic Salary", "Allowances",
                      "Deductions", "Net Salary", "Payment Date",
                      "Status", "Action"].map(h => (
                      <TableCell key={h}><b>{h}</b></TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No payroll records found.
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
                      <TableCell>
                        {months[record.month - 1]} {record.year}
                      </TableCell>
                      <TableCell>₹{Number(record.basicSalary).toLocaleString("en-IN")}</TableCell>
                      <TableCell>₹{Number(record.allowances).toLocaleString("en-IN")}</TableCell>
                      <TableCell>₹{Number(record.deductions).toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <b>₹{Number(record.netSalary).toLocaleString("en-IN")}</b>
                      </TableCell>
                      <TableCell>
                        {record.paymentDate
                          ? new Date(record.paymentDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Chip label={record.status}
                          color={record.status === "Paid" ? "success" : "warning"}
                          size="small" />
                      </TableCell>
                      <TableCell>
                        {record.status === "Pending" && (
                          <Button size="small" color="success"
                            onClick={() => markPaid(record._id)}>
                            Mark Paid
                          </Button>
                        )}
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
        <DialogTitle>Generate Payroll</DialogTitle>
        <DialogContent>
          <TextField select fullWidth margin="normal" label="Employee"
            name="employee" value={form.employee} onChange={change}>
            {employees.map(emp => (
              <MenuItem key={emp._id} value={emp._id}>
                {emp.name} ({emp.employeeId})
              </MenuItem>
            ))}
          </TextField>

          <TextField select fullWidth margin="normal" label="Month"
            name="month" value={form.month} onChange={change}>
            {months.map((month, index) => (
              <MenuItem key={month} value={index + 1}>{month}</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth margin="normal" type="number"
            label="Year" name="year" value={form.year} onChange={change} />

          <TextField fullWidth margin="normal" type="number"
            label="Basic Salary (₹)" name="basicSalary"
            value={form.basicSalary} onChange={change} />

          <TextField fullWidth margin="normal" type="number"
            label="Allowances (₹)" name="allowances"
            value={form.allowances} onChange={change} />

          <TextField fullWidth margin="normal" type="number"
            label="Deductions (₹)" name="deductions"
            value={form.deductions} onChange={change} />

          <Card sx={{ mt: 2, bgcolor: "action.hover" }}>
            <CardContent>
              <Typography color="text.secondary">Calculated Net Salary</Typography>
              <Typography variant="h5" fontWeight={800}>
                ₹{netSalary.toLocaleString("en-IN")}
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={creating}>
            {creating ? "Generating..." : "Generate Payroll"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
