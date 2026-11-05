
import React, { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
  Chip,
} from "@mui/material";

import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Apartment as ApartmentIcon,
  AccessTime as AttendanceIcon,
  EventNote as LeaveIcon,
  Payments as PayrollIcon,
  ReceiptLong as PayslipIcon,
  Star as PerformanceIcon,
  AccountBalance as FinanceIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";

import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 260;

function Layout() {
  const { user, logout } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isEmployee = user?.role === "Employee";
  const isAdmin = user?.role === "Admin";
  const isHR = user?.role === "HR";

  const employeeMenu = [
    { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
    { label: "My Profile", path: "/my-profile", icon: <PersonIcon /> },
    { label: "My Attendance", path: "/my-attendance", icon: <AttendanceIcon /> },
    { label: "My Leaves", path: "/my-leaves", icon: <LeaveIcon /> },
    { label: "My Performance", path: "/my-performance", icon: <PerformanceIcon /> },
    { label: "My Payroll", path: "/my-payroll", icon: <PayrollIcon /> },
  ];

  const managementMenu = [
    { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
    { label: "Employees", path: "/employees", icon: <PeopleIcon /> },
    { label: "Departments", path: "/departments", icon: <ApartmentIcon /> },
    { label: "Attendance", path: "/attendance", icon: <AttendanceIcon /> },
    { label: "Leaves", path: "/leaves", icon: <LeaveIcon /> },
    { label: "Payroll", path: "/payroll", icon: <PayrollIcon /> },
    { label: "Payslip History", path: "/payslip-history", icon: <PayslipIcon /> },
    { label: "Performance", path: "/performance", icon: <PerformanceIcon /> },
    { label: "Settings", path: "/settings", icon: <SettingsIcon /> },
  ];

  let menuItems = employeeMenu;

  if (isHR || isAdmin) {
    menuItems = [...managementMenu];

    if (isAdmin) {
      menuItems.splice(menuItems.length - 1, 0, {
        label: "Finance & Budget",
        path: "/finance",
        icon: <FinanceIcon />,
      });
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen((previous) => !previous);
  };

  const handleLogout = () => {
    logout();
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
      }}
    >
      {/* LOGO */}
      <Box
        sx={{
          height: 72,
          display: "flex",
          alignItems: "center",
          px: 2.5,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 25,
              fontWeight: 800,
              lineHeight: 1,
              color: "#1E3A8A",
            }}
          >
            Work
            <Box component="span" sx={{ color: "#800020" }}>
              Sphere
            </Box>
          </Typography>

          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 600,
              color: "#64748b",
              letterSpacing: 1.3,
              mt: 0.5,
            }}
          >
            EMPLOYEE ERP
          </Typography>
        </Box>
      </Box>

      {/* USER INFORMATION */}
      <Box
        sx={{
          px: 2,
          py: 2,
          background: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              background: "#1E3A8A",
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0) || "U"}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 14,
                color: "#172033",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name}
            </Typography>

            <Chip
              label={user?.role}
              size="small"
              sx={{
                height: 21,
                mt: 0.5,
                fontSize: 10,
                fontWeight: 700,
                background:
                  isEmployee ? "#E8EEFF" : "#F9E9EE",
                color:
                  isEmployee ? "#1E3A8A" : "#800020",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* MENU */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1.5 }}>
        <Typography
          sx={{
            px: 2.5,
            pb: 1,
            fontSize: 10,
            fontWeight: 800,
            color: "#94a3b8",
            letterSpacing: 1,
          }}
        >
          {isEmployee ? "MY WORKSPACE" : "MANAGEMENT"}
        </Typography>

        <List disablePadding>
          {menuItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname === item.path;

            return (
              <ListItem
                key={item.path}
                disablePadding
                sx={{ px: 1 }}
              >
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={() => {
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    minHeight: 44,
                    borderRadius: 2,
                    mb: 0.4,
                    px: 1.8,
                    color: isActive ? "#1E3A8A" : "#475569",
                    backgroundColor: isActive
                      ? "#E8EEFF"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                      color: "#1E3A8A",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 38, color: "inherit" }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 13.5,
                      fontWeight: isActive ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* LOGOUT */}
      <Box sx={{ p: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            minHeight: 44,
            borderRadius: 2,
            color: "#800020",
            "&:hover": {
              backgroundColor: "#F9E9EE",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: "#800020" }}>
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: 13.5,
              fontWeight: 600,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f7fb",
      }}
    >
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid #e5e7eb",
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* MOBILE SIDEBAR */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* MAIN AREA */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: "#ffffff",
            color: "#172033",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Toolbar
            sx={{
              minHeight: "72px !important",
              px: { xs: 2, md: 3 },
            }}
          >
            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                sx={{ mr: 1, color: "#1E3A8A" }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  fontSize: { xs: 16, md: 19 },
                  fontWeight: 700,
                  color: "#172033",
                }}
              >
                {menuItems.find(
                  (item) => item.path === location.pathname
                )?.label || "WorkSphere"}
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  color: "#94a3b8",
                  display: { xs: "none", sm: "block" },
                }}
              >
                WorkSphere Employee Management Portal
              </Typography>
            </Box>

            <Avatar
              sx={{
                width: 38,
                height: 38,
                background: "#1E3A8A",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0) || "U"}
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* PAGE CONTENT */}
        <Box
          component="main"
          sx={{
            width: "100%",
            minHeight: "calc(100vh - 72px)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;

