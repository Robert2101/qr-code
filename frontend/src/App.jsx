import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import useAdminStore from "./store/adminStore";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TransporterDashboard from "./pages/TransporterDashboard";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import { Toaster } from "react-hot-toast";

function App() {
  // State from the regular user/transporter auth store
  const { currentUser, role, loading: authLoading, checkAuth } = useAuthStore();

  // State from the new admin store
  const { admin, loading: adminLoading } = useAdminStore();

  useEffect(() => {
    checkAuth(); // Check user/transporter sessions
    // Admin session is restored by persist middleware automatically
  }, [checkAuth]);

  // Show a loading screen until both stores are ready
  if (authLoading || adminLoading) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <Routes>
        {/* =================== */}
        {/* Admin Routes */}
        {/* =================== */}
        <Route
          path="/admin/login"
          element={!admin ? <AdminLogin /> : <Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="/admin/*"
          element={admin ? <AdminDashboard /> : <Navigate to="/admin/login" replace />}
        />

        {/* =================== */}
        {/* Public & User/Transporter Routes */}
        {/* =================== */}

        {/* Root Path Logic */}
        <Route
          path="/"
          element={
            admin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : !currentUser ? (
              <Home />
            ) : role === "user" ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/transporter-dashboard" replace />
            )
          }
        />

        {/* Public Routes */}
        <Route
          path="/register"
          element={!currentUser && !admin ? <Register /> : <Navigate to="/" replace />}
        />
        <Route
          path="/login"
          element={!currentUser && !admin ? <Login /> : <Navigate to="/" replace />}
        />

        {/* Protected User/Transporter Routes */}
        <Route
          path="/dashboard"
          element={
            currentUser && role === "user" ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/transporter-dashboard"
          element={
            currentUser && role === "transporter" ? (
              <TransporterDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
