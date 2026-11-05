import React, { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useLoginMutation } from "../redux/authApi";
import { selectToken } from "../redux/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const token = useSelector(selectToken);

  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      // authApi's onQueryStarted stores the session in the Redux auth slice
      await login({
        email: email.trim().toLowerCase(),
        password,
      }).unwrap();

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err?.data?.message ||
        "Login failed. Check your email, password, and backend connection."
      );
    }
  }

  return (
    <Box className="login-container">
      <Card className="login-card">
        <Box textAlign="center" mb={4}>
          <Typography className="login-logo">
            Work<span>Sphere</span>
          </Typography>

          <Typography className="login-tagline">
            Smart Workforce Management
          </Typography>
        </Box>

        <Typography
          variant="h5"
          fontWeight={700}
          textAlign="center"
          mb={1}
        >
          Welcome back
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={3}
        >
          Sign in to access your workspace
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 3, py: 1.4, fontSize: "15px" }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign in to WorkSphere"
            )}
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
