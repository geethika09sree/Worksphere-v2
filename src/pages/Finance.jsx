
import React, { useState } from "react";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  MenuItem, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  useGetFinanceQuery,
  useAddFinanceMutation,
  useUpdateFinanceMutation,
  useDeleteFinanceMutation,
} from "../redux/workforceApi";

const initialForm = {
  type: "Income",
  category: "",
  description: "",
  amount: "",
  transactionDate: new Date().toISOString().split("T")[0],
  status: "Completed",
};

export default function Finance() {
  const { data, isLoading, isError } = useGetFinanceQuery();

  const [addFinance, { isLoading: adding }] = useAddFinanceMutation();
  const [updateFinance] = useUpdateFinanceMutation();
  const [deleteFinance] = useDeleteFinanceMutation();

  const records = data?.records || [];
  const summary = data?.summary || {
    income: 0,
    expenses: 0,
    balance: 0,
  };

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const change = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record._id);
    setForm({
      type: record.type,
      category: record.category,
      description: record.description || "",
      amount: record.amount,
      transactionDate: record.transactionDate
        ? new Date(record.transactionDate).toISOString().split("T")[0]
        : "",
      status: record.status,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.category.trim() || form.amount === "") {
      setMessage("Please enter category and amount.");
      return;
    }

    if (Number(form.amount) < 0 || !Number.isFinite(Number(form.amount))) {
      setMessage("Please enter a valid amount.");
      return;
    }

    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      if (editingId) {
        await updateFinance({ id: editingId, ...payload }).unwrap();
        setMessage("Transaction updated successfully.");
      } else {
        await addFinance(payload).unwrap();
        setMessage("Transaction added successfully.");
      }

      setOpen(false);
      setForm(initialForm);
      setEditingId(null);
    } catch (err) {
      setMessage(err?.data?.message || "Unable to save transaction.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;

    try {
      await deleteFinance(id).unwrap();
      setMessage("Transaction deleted successfully.");
    } catch (err) {
      setMessage(err?.data?.message || "Unable to delete transaction.");
    }
  };

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2
      }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Finance Management
          </Typography>
          <Typography color="text.secondary">
            Track income, expenses and company balance
          </Typography>
        </Box>
        <Button variant="contained" onClick={openAdd}>
          Add Transaction
        </Button>
      </Box>

      {message && (
        <Alert severity={
          message.includes("successfully") ? "success" : "info"
        } sx={{ mb: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load finance records.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ["Total Income", summary.income, "success.main"],
          ["Total Expenses", summary.expenses, "error.main"],
          ["Net Balance", summary.balance, "primary.main"],
        ].map(([label, value, color]) => (
          <Grid item xs={12} sm={4} key={label}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">{label}</Typography>
                <Typography variant="h4" fontWeight={800} color={color}>
                  {money(value)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Transactions
          </Typography>

          {isLoading ? (
            <Typography>Loading transactions...</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    {["Date", "Type", "Category", "Description",
                      "Amount", "Status", "Actions"].map(h => (
                      <TableCell key={h}><b>{h}</b></TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : records.map(record => (
                    <TableRow key={record._id}>
                      <TableCell>
                        {new Date(record.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.type}
                          color={record.type === "Income" ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.category}</TableCell>
                      <TableCell>{record.description || "-"}</TableCell>
                      <TableCell>
                        <b>{money(record.amount)}</b>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={record.status === "Completed" ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton color="primary"
                          onClick={() => openEdit(record)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error"
                          onClick={() => remove(record._id)}>
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

      <Dialog open={open} onClose={() => setOpen(false)}
        fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId ? "Edit Transaction" : "Add Transaction"}
        </DialogTitle>

        <DialogContent>
          <TextField select fullWidth margin="normal" label="Transaction Type"
            name="type" value={form.type} onChange={change}>
            <MenuItem value="Income">Income</MenuItem>
            <MenuItem value="Expense">Expense</MenuItem>
          </TextField>

          <TextField fullWidth margin="normal" label="Category"
            name="category" value={form.category} onChange={change}
            placeholder="e.g. Salary, Equipment, Maintenance" />

          <TextField fullWidth multiline rows={2} margin="normal"
            label="Description" name="description"
            value={form.description} onChange={change} />

          <TextField fullWidth margin="normal" type="number"
            label="Amount (₹)" name="amount"
            value={form.amount} onChange={change} />

          <TextField fullWidth margin="normal" type="date"
            label="Transaction Date" name="transactionDate"
            InputLabelProps={{ shrink: true }}
            value={form.transactionDate} onChange={change} />

          <TextField select fullWidth margin="normal" label="Status"
            name="status" value={form.status} onChange={change}>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={adding}>
            {adding ? "Saving..." : "Save Transaction"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
