
import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Chip,
  Grid,
  Alert,
} from "@mui/material";

import {
  useGetPayrollQuery,
  useGetEmployeesQuery,
  useCreatePayrollMutation,
  useUpdatePayrollStatusMutation,
} from "../redux/workforceApi";

const today = () => new Date().toISOString().slice(0, 10);

const money = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN")}`;

// Payroll records store month/year as numbers; the UI works with "YYYY-MM".
const toMonthKey = (record) =>
  `${record.year}-${String(record.month).padStart(2, "0")}`;

function formatMonth(month) {
  const date = new Date(`${month}-01T00:00:00`);

  return Number.isNaN(date.getTime())
    ? month
    : date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

export default function PayslipHistory() {
  // A payslip is simply a payroll record – the backend is the single source of truth.
  const { data, isLoading, isError } = useGetPayrollQuery();
  const { data: employeeData } = useGetEmployeesQuery();

  const [createPayroll, { isLoading: creating }] = useCreatePayrollMutation();
  const [updateStatus] = useUpdatePayrollStatusMutation();

  const employees = employeeData?.employees || [];

  const slips = useMemo(
    () =>
      (data?.records || []).map((record) => {
        const basic = Number(record.basicSalary) || 0;
        const allowances = Number(record.allowances) || 0;
        const deductions = Number(record.deductions) || 0;

        return {
          id: record._id,
          employee: record.employee?.name || "Employee",
          employeeId: record.employee?.employeeId || "",
          month: toMonthKey(record),
          basic,
          allowances,
          deductions,
          net: Number(record.netSalary) || basic + allowances - deductions,
          status: record.status || "Pending",
          paidDate: record.paymentDate
            ? String(record.paymentDate).slice(0, 10)
            : "",
        };
      }),
    [data]
  );

  const [employee, setEmployee] = useState("");
  const [month, setMonth] = useState("");
  const [basic, setBasic] = useState("");
  const [allowances, setAllowances] = useState("");
  const [deductions, setDeductions] = useState("");

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("All");
  const [message, setMessage] = useState("");

  // Picking an employee pre-fills their basic salary
  function selectEmployee(id) {
    setEmployee(id);

    const selected = employees.find((emp) => emp._id === id);

    if (selected?.salary && !basic) {
      setBasic(String(selected.salary));
    }
  }

  // Generate a payslip (creates a payroll record)
  async function addPayslip(e) {
    e.preventDefault();

    const basicAmount = Number(basic);
    const allowanceAmount = Number(allowances) || 0;
    const deductionAmount = Number(deductions) || 0;

    if (
      !employee ||
      !/^\d{4}-\d{2}$/.test(month) ||
      !Number.isFinite(basicAmount) ||
      basicAmount <= 0 ||
      allowanceAmount < 0 ||
      deductionAmount < 0 ||
      deductionAmount > basicAmount + allowanceAmount
    ) {
      setMessage("Please enter valid salary details.");
      return;
    }

    const [year, monthNumber] = month.split("-").map(Number);

    try {
      await createPayroll({
        employee,
        month: monthNumber,
        year,
        basicSalary: basicAmount,
        allowances: allowanceAmount,
        deductions: deductionAmount,
      }).unwrap();

      setEmployee("");
      setMonth("");
      setBasic("");
      setAllowances("");
      setDeductions("");

      setMessage("Payslip generated successfully.");
    } catch (err) {
      const text = err?.data?.message || "";

      setMessage(
        /duplicate|E11000/i.test(text)
          ? "A payslip already exists for this employee and month."
          : text || "Unable to generate payslip. Please enter valid salary details."
      );
    }
  }

  // Update payment status on the server (Payroll page updates automatically via cache tags)
  async function updatePayment(id, status, paidDate) {
    try {
      await updateStatus({
        id,
        status,
        paymentDate: status === "Paid" ? paidDate || today() : undefined,
      }).unwrap();

      setMessage(
        status === "Paid"
          ? "Salary payment marked as paid."
          : "Salary payment marked as pending."
      );
    } catch (err) {
      setMessage(
        err?.data?.message || "Unable to update payment status. Please enter valid details."
      );
    }
  }

  // Print payslip
  function printPayslip(s) {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to print payslips.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>WorkSphere Payslip</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #172033;
          }

          h1 {
            color: #1e3a8a;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
          }

          td {
            padding: 14px;
            border: 1px solid #ddd;
          }

          .total {
            font-weight: bold;
            font-size: 18px;
          }
        </style>
      </head>

      <body>
        <h1>WorkSphere</h1>
        <h2>Salary Payslip</h2>

        <p><b>Employee:</b> ${escapeHtml(s.employee)}</p>
        <p><b>Employee ID:</b> ${escapeHtml(s.employeeId)}</p>
        <p><b>Salary Month:</b> ${escapeHtml(formatMonth(s.month))}</p>
        <p><b>Payment Status:</b> ${escapeHtml(s.status)}</p>
        <p><b>Credited Date:</b> ${escapeHtml(s.paidDate || "Not credited")}</p>

        <table>
          <tr>
            <td>Basic Salary</td>
            <td>${money(s.basic)}</td>
          </tr>

          <tr>
            <td>Allowances</td>
            <td>${money(s.allowances)}</td>
          </tr>

          <tr>
            <td>Deductions</td>
            <td>${money(s.deductions)}</td>
          </tr>

          <tr class="total">
            <td>Net Salary</td>
            <td>${money(s.net)}</td>
          </tr>
        </table>

        <p style="margin-top:40px">
          Generated by WorkSphere
        </p>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  // Year filters
  const years = useMemo(() => {
    return [
      ...new Set(
        slips.map((s) => s.month.slice(0, 4))
          .filter((year) => /^\d{4}$/.test(year))
      ),
    ].sort((a, b) => b.localeCompare(a));
  }, [slips]);

  // Search and filtering
  const filtered = useMemo(() => {
    return slips
      .filter((s) => {
        const text =
          `${s.employee} ${s.employeeId} ${s.month}`.toLowerCase();

        const matchesSearch = text.includes(search.toLowerCase());

        const matchesYear =
          yearFilter === "All" ||
          s.month.startsWith(yearFilter);

        return matchesSearch && matchesYear;
      })
      .sort((a, b) =>
        b.month.localeCompare(a.month)
      );
  }, [slips, search, yearFilter]);

  const totalSalary = filtered.reduce(
    (sum, s) => sum + s.net,
    0
  );

  const totalPaid = filtered
    .filter((s) => s.status === "Paid")
    .reduce((sum, s) => sum + s.net, 0);

  const totalPending = filtered
    .filter((s) => s.status !== "Paid")
    .reduce((sum, s) => sum + s.net, 0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>

      <Typography variant="h4" fontWeight={800} mb={1}>
        Payslip History
      </Typography>

      <Typography color="text.secondary" mb={3}>
        Manage employee payslips, salary payments and payment history.
      </Typography>

      {message && (
        <Alert
          severity={
            /valid|already|unable|failed/i.test(message)
              ? "warning"
              : "success"
          }
          sx={{ mb: 2 }}
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load payslips.
        </Alert>
      )}

      {/* SUMMARY CARDS */}

      <Grid container spacing={2} mb={3}>
        {[
          {
            title: "Total Net Salary",
            amount: totalSalary,
            color: "#1E3A8A",
          },
          {
            title: "Salary Paid",
            amount: totalPaid,
            color: "#15803D",
          },
          {
            title: "Salary Pending",
            amount: totalPending,
            color: "#B45309",
          },
        ].map((item) => (
          <Grid item xs={12} sm={4} key={item.title}>
            <Card sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent>
                <Typography color="text.secondary">
                  {item.title}
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ color: item.color, mt: 1 }}
                >
                  {money(item.amount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* GENERATE PAYSLIP */}

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Generate New Payslip
          </Typography>

          <Box
            component="form"
            onSubmit={addPayslip}
            sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
          >
            <TextField
              select
              label="Employee"
              value={employee}
              onChange={(e) => selectEmployee(e.target.value)}
              required
              sx={{ minWidth: 220 }}
            >
              {employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Salary Month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Basic Salary (₹)"
              type="number"
              value={basic}
              onChange={(e) => setBasic(e.target.value)}
              required
              inputProps={{ min: 0, step: "0.01" }}
            />

            <TextField
              label="Allowances (₹)"
              type="number"
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
            />

            <TextField
              label="Deductions (₹)"
              type="number"
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
            />

            <Button type="submit" variant="contained" disabled={creating}>
              {creating ? "Generating..." : "Generate Payslip"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* SEARCH AND FILTER */}

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <TextField
          fullWidth
          label="Search employee, ID or month"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
        />

        <TextField
          select
          label="Filter by year"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="All">All Years</MenuItem>

          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* PAYSLIP RECORDS */}

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Salary Records ({filtered.length})
          </Typography>

          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">

              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Month</TableCell>
                  <TableCell>Basic</TableCell>
                  <TableCell>Allowances</TableCell>
                  <TableCell>Deductions</TableCell>
                  <TableCell>Net Salary</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Credited Date</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>

                    <TableCell>{s.employee}</TableCell>
                    <TableCell>{s.employeeId}</TableCell>
                    <TableCell>{formatMonth(s.month)}</TableCell>
                    <TableCell>{money(s.basic)}</TableCell>
                    <TableCell>{money(s.allowances)}</TableCell>
                    <TableCell>{money(s.deductions)}</TableCell>

                    <TableCell>
                      <b>{money(s.net)}</b>
                    </TableCell>

                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={s.status}
                        onChange={(e) =>
                          updatePayment(
                            s.id,
                            e.target.value,
                            s.paidDate
                          )
                        }
                        sx={{ minWidth: 110 }}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Paid">Paid</MenuItem>
                      </TextField>
                    </TableCell>

                    <TableCell>
                      <TextField
                        type="date"
                        size="small"
                        value={s.paidDate || ""}
                        disabled={s.status !== "Paid"}
                        onChange={(e) =>
                          updatePayment(
                            s.id,
                            "Paid",
                            e.target.value
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 145 }}
                      />
                    </TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => printPayslip(s)}
                      >
                        Print
                      </Button>
                    </TableCell>

                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      {isLoading ? "Loading payslips..." : "No payslips found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </Box>
        </CardContent>
      </Card>

    </Box>
  );
}

