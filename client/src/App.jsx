import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore.js";
import { Toaster } from "react-hot-toast";

import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import UserDashboardPage from "./pages/UserDashboardPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import UserProfilePage from "./pages/UserProfilePage";

const LogoutPage = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      await logout(navigate);
    };

    handleLogout();
  }, [logout, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
      <span className="ml-2">Logging out...</span>
    </div>
  );
};

// Home component that redirects based on user role
const HomePage = () => {
  const { authUser } = useAuthStore();

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  if (authUser.role === "admin") {
    return <AdminDashboardPage />;
  } else {
    return <UserDashboardPage />;
  }
};

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    console.log("Still checking auth, showing loader...");
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-lime-50">
        <div className="text-center">
          <Loader className="size-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Routes>
        {/* Main route - redirects based on authentication and role */}
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />

        {/* User Dashboard Route */}
        <Route
          path="/dashboard/user"
          element={
            authUser && authUser.role === "user" ? (
              <UserDashboardPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/profile"
          element={authUser ? <UserProfilePage /> : <Navigate to="/login" />}
        />

        {/* Admin Dashboard Route */}
        <Route
          path="/dashboard/admin"
          element={
            authUser && authUser.role === "admin" ? (
              <AdminDashboardPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Auth Routes */}
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/logout"
          element={authUser ? <LogoutPage /> : <Navigate to="/login" />}
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
          },
        }}
      />
    </div>
  );
};

export default App;
