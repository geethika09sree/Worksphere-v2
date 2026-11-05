import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout as reduxLogout, selectCurrentUser } from "../redux/authSlice";

export function AuthProvider({ children }) {
  return children;
}

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  // The store's listener middleware also clears the session and the API cache
  function logout() {
    dispatch(reduxLogout());
  }

  return {
    user,
    logout,
  };
}
