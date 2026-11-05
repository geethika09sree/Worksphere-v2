
import React, { useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  Add,
  Delete,
  Edit,
  People,
  Search,
  EventAvailable,
  PersonOff,
  History,
  ExitToApp,
  RestartAlt,
} from "@mui/icons-material";

import {
  useGetEmployeesQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "../redux/workforceApi";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  salary: "",
  joiningDate: "",
};

const CURRENT_YEAR = new Date().getFullYear();

function dateOnly(value) {
  if (!value) return "";
  return String(value).substring(0, 10);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error) {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.error ||
    "Something went wrong. Please try again."
  );
}

function Employees() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetEmployeesQuery();

  const [addEmployee, { isLoading: adding }] =
    useAddEmployeeMutation();

  const [updateEmployee, { isLoading: updating }] =
    useUpdateEmployeeMutation();

  const [deleteEmployee, { isLoading: deleting }] =
    useDeleteEmployeeMutation();

  const employees = Array.isArray(data)
    ? data
    : data?.employees || [];

  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [resignDialog, setResignDialog] = useState(false);

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [resignationForm, setResignationForm] = useState({
    resignationDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  const [selectedYear, setSelectedYear] = useState("All");
  const [message, setMessage] = useState(null);

  const years = useMemo(() => {
    const found = new Set([String(CURRENT_YEAR)]);

    employees.forEach((employee) => {
      if (employee.joiningDate) {
        found.add(dateOnly(employee.joiningDate).substring(0, 4));
      }

      if (employee.resignationDate) {
        found.add(dateOnly(employee.resignationDate).substring(0, 4));
      }
    });

    return [...found].sort((a, b) => Number(b) - Number(a));
  }, [employees]);

  const activeCount = employees.filter(
    (employee) => employee.status !== "Resigned"
  ).length;

  const resignedCount = employees.filter(
    (employee) => employee.status === "Resigned"
  ).length;

  const displayYear =
    selectedYear === "All" ? String(CURRENT_YEAR) : selectedYear;

  const newJoiners = employees.filter(
    (employee) =>
      dateOnly(employee.joiningDate).substring(0, 4) === displayYear
  ).length;

  const yearlyResignations = employees.filter(
    (employee) =>
      employee.status === "Resigned" &&
      dateOnly(employee.resignationDate).substring(0, 4) === displayYear
  ).length;

  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      String(employee.employeeId || "").toLowerCase().includes(searchText) ||
      String(employee.name || "").toLowerCase().includes(searchText) ||
      String(employee.email || "").toLowerCase().includes(searchText) ||
      String(employee.department || "").toLowerCase().includes(searchText) ||
      String(employee.designation || "").toLowerCase().includes(searchText);

    const matchesYear =
      selectedYear === "All" ||
      dateOnly(employee.joiningDate).substring(0, 4) === selectedYear ||
      dateOnly(employee.resignationDate).substring(0, 4) === selectedYear;

    return matchesSearch && matchesYear;
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddDialog = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setMessage(null);
    setOpenDialog(true);
  };

  const openEditDialog = (employee) => {
    setEditingEmployee(employee);

    setForm({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "",
      designation: employee.designation || "",
      salary: employee.salary ?? "",
      joiningDate: dateOnly(employee.joiningDate),
    });

    setMessage(null);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.department ||
      !form.designation.trim() ||
      !form.salary ||
      !form.joiningDate
    ) {
      setMessage({
        type: "warning",
        text: "Please fill all required fields.",
      });
      return;
    }

    if (Number(form.salary) <= 0) {
      setMessage({
        type: "warning",
        text: "Salary must be greater than zero.",
      });
      return;
    }

    const employeeData = {
      ...form,
      salary: Number(form.salary),
    };

    try {
      if (editingEmployee) {
        await updateEmployee({
          id: editingEmployee._id,
          ...employeeData,
        }).unwrap();

        setMessage({
          type: "success",
          text: "Employee details updated successfully.",
        });
      } else {
        await addEmployee({
          ...employeeData,
          employeeId: `EMP-${Date.now()}`,
        }).unwrap();

        setMessage({
          type: "success",
          text: "Employee added successfully.",
        });
      }

      closeDialog();
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error),
      });
    }
  };

  function openResignDialog(employee) {
    setSelectedEmployee(employee);

    setResignationForm({
      resignationDate: new Date().toISOString().split("T")[0],
      reason: "",
    });

    setResignDialog(true);
  }

  const handleResignation = async () => {
    if (!selectedEmployee) return;

    if (!resignationForm.resignationDate) {
      setMessage({
        type: "warning",
        text: "Please select the resignation date.",
      });
      return;
    }

    try {
      await updateEmployee({
        id: selectedEmployee._id,
        status: "Resigned",
        resignationDate: resignationForm.resignationDate,
        resignationReason: resignationForm.reason,
      }).unwrap();

      setMessage({
        type: "success",
        text: `${selectedEmployee.name} has been marked as resigned.`,
      });

      setResignDialog(false);
      setSelectedEmployee(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error),
      });
    }
  };

  const handleReinstate = async (employee) => {
    const confirmed = window.confirm(
      `Reinstate ${employee.name} as an active employee?`
    );

    if (!confirmed) return;

    try {
      await updateEmployee({
        id: employee._id,
        status: "Active",
        resignationDate: null,
        resignationReason: "",
      }).unwrap();

      setMessage({
        type: "success",
        text: `${employee.name} has been reinstated.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error),
      });
    }
  };

  const handleDelete = async (id) => {
    const employee = employees.find(
      (item) => item._id === id
    );

    const confirmed = window.confirm(
      `Permanently delete ${employee?.name}? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteEmployee(id).unwrap();

      setMessage({
        type: "success",
        text: "Employee permanently deleted.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error),
      });
    }
  };

  if (isLoading) {
    return (
      <Box className="page-container">
        <Typography>Loading employees from MongoDB...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="page-container">
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not load employees: {getErrorMessage(error)}
        </Alert>
        <Button variant="contained" onClick={refetch}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box className="page-container">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography className="page-title">
            Employees
          </Typography>
          <Typography className="page-subtitle">
            Manage employees, joining records and resignations.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAddDialog}
          sx={{
            background: "#1E3A8A",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            "&:hover": { background: "#172f70" },
          }}
        >
          Add Employee
        </Button>
      </Box>

      {message && (
        <Alert
          severity={message.type}
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {(adding || updating || deleting) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Saving changes to MongoDB...
        </Alert>
      )}

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <TextField
            select
            size="small"
            label="Statistics and history year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ minWidth: 230 }}
          >
            <MenuItem value="All">All Years</MenuItem>
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={1}
          >
            Select a year to filter joining and resignation records.
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <CardContent>
              <People sx={{ color: "#1E3A8A", fontSize: 30 }} />
              <Typography color="text.secondary" fontSize={12}>
                Total Employee Records
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {employees.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <CardContent>
              <People sx={{ color: "#166534", fontSize: 30 }} />
              <Typography color="text.secondary" fontSize={12}>
                Active Employees
              </Typography>
              <Typography variant="h4" fontWeight={800} color="success.main">
                {activeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <CardContent>
              <EventAvailable sx={{ color: "#1E3A8A", fontSize: 30 }} />
              <Typography color="text.secondary" fontSize={12}>
                Joined in {displayYear}
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {newJoiners}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb" }}>
            <CardContent>
              <PersonOff sx={{ color: "#800020", fontSize: 30 }} />
              <Typography color="text.secondary" fontSize={12}>
                Resigned in {displayYear}
              </Typography>
              <Typography variant="h4" fontWeight={800} color="#800020">
                {yearlyResignations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Yearly Resignation Statistics
          </Typography>

          <Grid container spacing={2}>
            {years.map((year) => {
              const count = employees.filter(
                (employee) =>
                  employee.status === "Resigned" &&
                  dateOnly(employee.resignationDate).substring(0, 4) === year
              ).length;

              return (
                <Grid item xs={12} sm={6} md={3} key={year}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: "#fff5f5",
                      border: "1px solid #f3d5dc",
                    }}
                  >
                    <Typography color="text.secondary" fontSize={12}>
                      {year}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#800020">
                      {count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Resignations
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb" }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Employee Directory
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Search by employee ID, name, email, department..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#f8fafc" }}>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Joining Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee._id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            background: "#E8EEFF",
                            color: "#1E3A8A",
                            fontWeight: 700,
                          }}
                        >
                          {(employee.name || "?").charAt(0)}
                        </Avatar>

                        <Box>
                          <Typography fontSize={13} fontWeight={700}>
                            {employee.name}
                          </Typography>
                          <Typography fontSize={11} color="text.secondary">
                            {employee.employeeId} · {employee.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>{formatDate(employee.joiningDate)}</TableCell>

                    <TableCell>
                      <Chip
                        label={employee.status || "Active"}
                        size="small"
                        color={
                          employee.status === "Resigned" ? "error" : "success"
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        <IconButton
                          size="small"
                          title="Edit employee"
                          onClick={() => openEditDialog(employee)}
                          sx={{ color: "#1E3A8A" }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>

                        {employee.status !== "Resigned" ? (
                          <IconButton
                            size="small"
                            title="Mark as resigned"
                            onClick={() => openResignDialog(employee)}
                            sx={{ color: "#800020" }}
                          >
                            <ExitToApp fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            title="Reinstate employee"
                            onClick={() => handleReinstate(employee)}
                            sx={{ color: "#166534" }}
                          >
                            <RestartAlt fontSize="small" />
                          </IconButton>
                        )}

                        <IconButton
                          size="small"
                          title="Permanently delete"
                          onClick={() => handleDelete(employee._id)}
                          sx={{ color: "#64748b" }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <History sx={{ color: "#1E3A8A" }} />
            <Typography variant="h6" fontWeight={700}>
              Employee Joining & Resignation History
            </Typography>
          </Box>

          <Typography color="text.secondary" variant="body2" mb={2}>
            A record of when each employee joined and, if applicable, when they left.
          </Typography>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#f8fafc" }}>
                  <TableCell>Employee</TableCell>
                  <TableCell>Joining Date</TableCell>
                  <TableCell>Resignation Date</TableCell>
                  <TableCell>Resignation Reason</TableCell>
                  <TableCell>Current Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredEmployees
                  .slice()
                  .sort((a, b) =>
                    String(b.joiningDate || "").localeCompare(
                      String(a.joiningDate || "")
                    )
                  )
                  .map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {employee.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.department}
                        </Typography>
                      </TableCell>

                      <TableCell>{formatDate(employee.joiningDate)}</TableCell>
                      <TableCell>{formatDate(employee.resignationDate)}</TableCell>
                      <TableCell>{employee.resignationReason || "-"}</TableCell>

                      <TableCell>
                        <Chip
                          label={employee.status || "Active"}
                          size="small"
                          color={
                            employee.status === "Resigned" ? "error" : "success"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No lifecycle records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={800}>
          {editingEmployee ? "Edit Employee" : "Add Employee"}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              >
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Human Resources">Human Resources</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Salary"
                name="salary"
                type="number"
                value={form.salary}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Joining Date"
                name="joiningDate"
                type="date"
                value={form.joiningDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={adding || updating}
            sx={{ background: "#1E3A8A" }}
          >
            {editingEmployee ? "Save Changes" : "Add Employee"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={resignDialog}
        onClose={() => setResignDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={800}>
          Record Employee Resignation
        </DialogTitle>

        <DialogContent>
          {selectedEmployee && (
            <Alert severity="warning" sx={{ mb: 2, mt: 1 }}>
              You are recording the resignation of{" "}
              <strong>{selectedEmployee.name}</strong>. Their employee record will be retained.
            </Alert>
          )}

          <TextField
            fullWidth
            type="date"
            label="Resignation Date"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={resignationForm.resignationDate}
            onChange={(e) =>
              setResignationForm({
                ...resignationForm,
                resignationDate: e.target.value,
              })
            }
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Resignation Reason"
            margin="normal"
            placeholder="Enter the reason for resignation..."
            value={resignationForm.reason}
            onChange={(e) =>
              setResignationForm({
                ...resignationForm,
                reason: e.target.value,
              })
            }
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResignDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleResignation}
            disabled={updating}
          >
            Confirm Resignation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Employees;
