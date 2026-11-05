import React, { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";

import {
  Notifications,
  Security,
  Settings as SettingsIcon,
} from "@mui/icons-material";

import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { saveSettings, selectSettings } from "../redux/settingsSlice";

export default function Settings() {
  const { user } = useAuth();

  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);

  // Draft values – only committed to the store (and persisted) on Save
  const [emailNotifications, setEmailNotifications] =
    useState(settings.emailNotifications);

  const [systemNotifications, setSystemNotifications] =
    useState(settings.systemNotifications);

  const [saved, setSaved] = useState(false);

  function handleSave() {
    dispatch(
      saveSettings({
        emailNotifications,
        systemNotifications,
      })
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <Box className="page-container">

      <Typography className="page-title">
        Settings
      </Typography>

      <Typography className="page-subtitle">
        Manage your WorkSphere preferences.
      </Typography>

      {saved && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
        >
          Settings saved successfully.
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>

        <CardContent>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mb: 2,
            }}
          >

            <SettingsIcon color="primary" />

            <Typography
              variant="h6"
              fontWeight={700}
            >
              General Settings
            </Typography>

          </Box>

          <Divider sx={{ mb: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={systemNotifications}
                onChange={(e) =>
                  setSystemNotifications(
                    e.target.checked
                  )
                }
              />
            }
            label="Enable system notifications"
          />

        </CardContent>

      </Card>

      <Card sx={{ mb: 3 }}>

        <CardContent>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mb: 2,
            }}
          >

            <Notifications color="primary" />

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Notification Settings
            </Typography>

          </Box>

          <Divider sx={{ mb: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={emailNotifications}
                onChange={(e) =>
                  setEmailNotifications(
                    e.target.checked
                  )
                }
              />
            }
            label="Receive email notifications"
          />

        </CardContent>

      </Card>

      <Card sx={{ mb: 3 }}>

        <CardContent>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mb: 2,
            }}
          >

            <Security color="primary" />

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Account Information
            </Typography>

          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography>
            <strong>Name:</strong>{" "}
            {user?.name}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Email:</strong>{" "}
            {user?.email}
          </Typography>

          <Typography sx={{ mt: 1 }}>
            <strong>Role:</strong>{" "}
            {user?.role}
          </Typography>

        </CardContent>

      </Card>

      <Button
        variant="contained"
        size="large"
        onClick={handleSave}
      >
        Save Settings
      </Button>

    </Box>
  );
}
