
import React, { useState } from "react";
import {
  Alert,
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
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  useGetDepartmentsQuery,
  useAddDepartmentMutation,
  useDeleteDepartmentMutation,
} from "../redux/workforceApi";

export default function Departments() {
  const { data: departments = [], isLoading, error } =
    useGetDepartmentsQuery();

  const [addDepartment, { isLoading: adding }] =
    useAddDepartmentMutation();

  const [deleteDepartment] = useDeleteDepartmentMutation();

  const [name, setName] = useState("");
  const [manager, setManager] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  async function handleAddDepartment(e) {
    e.preventDefault();
    setMessage("");

    try {
      await addDepartment({
        name: name.trim(),
        manager: manager.trim(),
        budget: Number(budget) || 0,
        description: description.trim(),
      }).unwrap();

      setName("");
      setManager("");
      setBudget("");
      setDescription("");
      setMessage("Department added successfully.");
    } catch (err) {
      setMessage(
        err?.data?.message || "Could not add department."
      );
    }
  }

  async function handleDeleteDepartment(id) {
    if (!window.confirm("Delete this department?")) return;

    try {
      await deleteDepartment(id).unwrap();
      setMessage("Department deleted successfully.");
    } catch (err) {
      setMessage(
        err?.data?.message || "Could not delete department."
      );
    }
  }

  const filtered = departments.filter((department) =>
    `${department.name || ""} ${department.manager || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={800} mb={1}>
        Departments
      </Typography>

      <Typography color="text.secondary" mb={3}>
        Manage company departments and department managers.
      </Typography>

      {message && (
        <Alert
          severity={
            message.toLowerCase().includes("could not")
              ? "error"
              : "success"
          }
          sx={{ mb: 2 }}
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load departments. Check your backend connection
          and Admin login.
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Add New Department
          </Typography>

          <Box
            component="form"
            onSubmit={handleAddDepartment}
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <TextField
              label="Department Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextField
              label="Manager Name"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
            />

            <TextField
              label="Budget (₹)"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={adding}
            >
              {adding ? "Adding..." : "Add Department"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <TextField
        fullWidth
        label="Search departments"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Department Records ({filtered.length})
          </Typography>

          {isLoading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell>Manager</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filtered.map((department) => (
                    <TableRow key={department._id}>
                      <TableCell>{department.name}</TableCell>
                      <TableCell>
                        {department.manager || "Not assigned"}
                      </TableCell>
                      <TableCell>
                        ₹{Number(department.budget || 0).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() =>
                            handleDeleteDepartment(department._id)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No departments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
