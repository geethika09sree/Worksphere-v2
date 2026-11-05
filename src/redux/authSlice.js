import { createSlice } from "@reduxjs/toolkit";
import { loadAuthState } from "./persist";

// Reducers are pure. Persisting to localStorage and clearing the API cache on
// logout are side effects, handled by the listener middleware in store.js.
const authSlice = createSlice({
  name: "auth",
  initialState: loadAuthState(),

  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },

    // Refresh the user profile (e.g. after /auth/me) without touching the token
    setUser: (state, action) => {
      state.user = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
