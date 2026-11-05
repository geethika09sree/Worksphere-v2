import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authSlice";

// Set VITE_API_URL in Vercel (e.g. https://worksphere-api.vercel.app/api).
// The localhost fallback only applies to `npm run dev`.
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,

  // Attach the JWT to every request
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

// If the server rejects our token (expired / invalid) we log out.
// store.js listens for `logout` and clears the cached API data.
const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && api.getState().auth?.token) {
    api.dispatch(logout());
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Employee",
    "Attendance",
    "Leave",
    "Department",
    "Payroll",
    "Performance",
    "Finance",
    "Holiday",
  ],
  endpoints: () => ({}),
});
