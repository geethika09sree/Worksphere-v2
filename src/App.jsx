import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "./context/AuthContext";
import { useGetMeQuery } from "./redux/authApi";
import { selectToken } from "./redux/authSlice";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyProfile from "./pages/MyProfile";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Payroll from "./pages/Payroll";
import Performance from "./pages/Performance";
import Settings from "./pages/Settings";
import MyAttendance from "./pages/MyAttendance";
import MyPerformance from "./pages/MyPerformance";
import MyPayroll from "./pages/MyPayroll";
import Departments from "./pages/Departments";
import Finance from "./pages/Finance";
import PayslipHistory from "./pages/PayslipHistory";

function Protected({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  // Validate the stored token and refresh the user once per session.
  // A 401 here logs the user out automatically (see apiSlice).
  const token = useSelector(selectToken);
  useGetMeQuery(undefined, { skip: !token });

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="employees" element={<Protected allowedRoles={["Admin", "HR"]}><Employees /></Protected>} />
        <Route path="attendance" element={<Protected allowedRoles={["Admin", "HR"]}><Attendance /></Protected>} />
        <Route path="leaves" element={<Protected allowedRoles={["Admin", "HR"]}><Leaves /></Protected>} />
        <Route path="payroll" element={<Protected allowedRoles={["Admin", "HR"]}><Payroll /></Protected>} />
        <Route path="performance" element={<Protected allowedRoles={["Admin", "HR"]}><Performance /></Protected>} />
        <Route path="settings" element={<Protected allowedRoles={["Admin", "HR"]}><Settings /></Protected>} />
        <Route path="departments" element={<Protected allowedRoles={["Admin", "HR"]}><Departments /></Protected>} />
        <Route path="finance" element={<Protected allowedRoles={["Admin"]}><Finance /></Protected>} />
        <Route path="payslip-history" element={<Protected allowedRoles={["Admin", "HR"]}><PayslipHistory /></Protected>} />

        <Route path="my-attendance" element={<Protected allowedRoles={["Employee"]}><MyAttendance /></Protected>} />
        <Route path="my-leaves" element={<Protected allowedRoles={["Employee"]}><Leaves /></Protected>} />
        <Route path="my-performance" element={<Protected allowedRoles={["Employee"]}><MyPerformance /></Protected>} />
        <Route path="my-profile" element={<Protected allowedRoles={["Employee"]}><MyProfile /></Protected>} />
        <Route path="my-payroll" element={<Protected allowedRoles={["Employee"]}><MyPayroll /></Protected>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}