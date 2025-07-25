import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const CheckAuth = ({ isAuthenticated, user, children }) => {
  const location = useLocation();

  // Redirect unauthenticated users to login (except if already on login page)
  if (!isAuthenticated) {
    if (location.pathname !== "/auth/login") {
      return <Navigate to="/auth/login" replace />;
    }
    return <>{children}</>; // Allow access to login page
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && location.pathname === "/auth/login") {
    return (
      <Navigate
        to={
          user?.role === "admin"
            ? "/admin/dashboard"
            : user?.role === "kitchen"
            ? "/kitchen/home"
            : "/staff/home"
        }
        replace
      />
    );
  }

  // Prevent users from accessing wrong role-based routes
  if (isAuthenticated) {
    if (user?.role === "admin" && location.pathname.startsWith("/staff")) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === "staff" && location.pathname.startsWith("/admin")) {
      return <Navigate to="/staff/home" replace />;
    }
    if (user?.role === "kitchen" && !location.pathname.startsWith("/kitchen")) {
      return <Navigate to="/kitchen/home" replace />;
    }
  }

  return <>{children}</>;
};

export default CheckAuth;
