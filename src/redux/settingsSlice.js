import { createSlice } from "@reduxjs/toolkit";
import { KEYS, loadJson } from "./persist";

const defaults = {
  emailNotifications: true,
  systemNotifications: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState: loadJson(KEYS.settings, defaults),

  reducers: {
    saveSettings: (state, action) => {
      state.emailNotifications = Boolean(action.payload.emailNotifications);
      state.systemNotifications = Boolean(action.payload.systemNotifications);
    },
  },
});

export const { saveSettings } = settingsSlice.actions;

export const selectSettings = (state) => state.settings;

export default settingsSlice.reducer;
