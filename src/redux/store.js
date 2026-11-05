import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import authReducer, { setCredentials, setUser, logout } from "./authSlice";
import settingsReducer, { saveSettings } from "./settingsSlice";
import { apiSlice } from "./apiSlice";
import { KEYS, storage } from "./persist";

// All side effects (localStorage persistence, cache clearing) live here,
// so the reducers stay pure.
const listener = createListenerMiddleware();

// Persist the session whenever it changes
listener.startListening({
  matcher: isAnyOf(setCredentials, setUser),
  effect: (_action, api) => {
    const { user, token } = api.getState().auth;

    if (user) storage.set(KEYS.user, JSON.stringify(user));
    if (token) storage.set(KEYS.token, token);
  },
});

// On logout: forget the session AND drop cached API data so the next user
// never sees the previous user's records.
listener.startListening({
  actionCreator: logout,
  effect: (_action, api) => {
    storage.remove(KEYS.user);
    storage.remove(KEYS.token);
    api.dispatch(apiSlice.util.resetApiState());
  },
});

listener.startListening({
  actionCreator: saveSettings,
  effect: (_action, api) => {
    storage.set(KEYS.settings, JSON.stringify(api.getState().settings));
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listener.middleware)
      .concat(apiSlice.middleware),
});

// Keep tabs in sync: logging out in one tab logs out the others.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === KEYS.token && !event.newValue && store.getState().auth.token) {
      store.dispatch(logout());
    }
  });
}
