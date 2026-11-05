import React from "react";

import {
  Box,
  Card,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  Payments,
  AccountBalance,
} from "@mui/icons-material";

import {
  useGetMyEmployeeQuery,
  useGetMyPayrollQuery,
} from "../redux/workforceApi";

import { money } from "../utils/format";

export default function MyPayroll() {
  const { data } = useGetMyEmployeeQuery();
  const { data: payrollData, isLoading: payslipsLoading } =
    useGetMyPayrollQuery();

  const payslips = payrollData?.records || [];

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
          My Payroll
        </Typography>

        <Card
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >

          <Typography>
            Payroll information could not be
            found.
          </Typography>

        </Card>

      </Box>
    );
  }


  const monthlySalary =
    Number(employee.salary) || 0;


  return (
    <Box className="page-container">

      <Typography className="page-title">
        My Payroll
      </Typography>

      <Typography className="page-subtitle">
        View your salary and payroll details.
      </Typography>


      {/* SALARY SUMMARY */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >

        <Grid item xs={12} md={6}>

          <Card
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >

            <Payments
              sx={{
                color: "#800020",
                fontSize: 35,
                mb: 1,
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Monthly Salary
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                color: "#1E3A8A",
                mt: 0.5,
              }}
            >
              {money(monthlySalary)}
            </Typography>

          </Card>

        </Grid>


        <Grid item xs={12} md={6}>

          <Card
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >

            <AccountBalance
              sx={{
                color: "#1E3A8A",
                fontSize: 35,
                mb: 1,
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Annual Salary
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                color: "#800020",
                mt: 0.5,
              }}
            >
              {money(
                monthlySalary * 12
              )}
            </Typography>

          </Card>

        </Grid>

      </Grid>


      {/* EMPLOYEE PAYROLL DETAILS */}

      <Card
        sx={{
          p: 3,
          borderRadius: 3,
        }}
      >

        <Typography
          variant="h6"
          fontWeight={700}
          mb={3}
        >
          Salary Details
        </Typography>


        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,
          }}
        >

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Employee Name
            </Typography>

            <Typography fontWeight={600}>
              {employee.name}
            </Typography>
          </Box>


          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Employee ID
            </Typography>

            <Typography fontWeight={600}>
              {employee.id}
            </Typography>
          </Box>


          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Department
            </Typography>

            <Typography fontWeight={600}>
              {employee.department}
            </Typography>
          </Box>


          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Designation
            </Typography>

            <Typography fontWeight={600}>
              {employee.designation}
            </Typography>
          </Box>


          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Joining Date
            </Typography>

            <Typography fontWeight={600}>
              {employee.joiningDate}
            </Typography>
          </Box>


          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Monthly Gross Salary
            </Typography>

            <Typography
              fontWeight={700}
              sx={{
                color: "#1E3A8A",
              }}
            >
              {money(monthlySalary)}
            </Typography>
          </Box>

        </Box>

      </Card>

      {/* PAYSLIP HISTORY */}

      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          mt: 3,
        }}
      >

        <Typography
          variant="h6"
          fontWeight={700}
          mb={2}
        >
          Payslip History
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">

            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Basic</TableCell>
                <TableCell>Allowances</TableCell>
                <TableCell>Deductions</TableCell>
                <TableCell>Net Salary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Credited Date</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {payslips.map((slip) => (
                <TableRow key={slip._id}>
                  <TableCell>
                    {new Date(
                      slip.year,
                      slip.month - 1,
                      1
                    ).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{money(slip.basicSalary)}</TableCell>
                  <TableCell>{money(slip.allowances)}</TableCell>
                  <TableCell>{money(slip.deductions)}</TableCell>
                  <TableCell>
                    <b>{money(slip.netSalary)}</b>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={slip.status}
                      color={slip.status === "Paid" ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {slip.paymentDate
                      ? new Date(slip.paymentDate).toLocaleDateString("en-IN")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}

              {payslips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {payslipsLoading
                      ? "Loading payslips..."
                      : "No payslips have been generated yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

          </Table>
        </Box>

      </Card>

    </Box>
  );
}
