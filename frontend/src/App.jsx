import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import useAdminStore from "./store/adminStore";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TransporterDashboard from "./pages/TransporterDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import { Toaster } from "react-hot-toast";

function App() {
  // State from the regular user/transporter auth store
  const { currentUser, role, loading: authLoading, checkAuth } = useAuthStore();

  // State from the new admin store
  const { admin, isAuthChecked: isAdminAuthChecked, checkAuth: checkAdminAuth } = useAdminStore();

  useEffect(() => {
    // Check sessions for all roles on initial load
    checkAuth();
    checkAdminAuth();
  }, [checkAuth, checkAdminAuth]);

  // Show a loading screen until auth status for all roles is determined
  if (authLoading || !isAdminAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-semibold">Loading...</h2>
      </div>
    );
  }

  // --- ROUTING LOGIC ---

  // 1. If an admin is logged in, only render admin-specific routes.
  if (admin) {
    return (
      <>
        <Routes>
          <Route path="/admin/*" element={<AdminDashboard />} />
          {/* Any other path redirects to the admin dashboard */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
        <Toaster position="top-center" reverseOrder={false} />
      </>
    );
  }

  // 2. If a regular user or transporter is logged in, render their routes.
  if (currentUser) {
    return (
      <>
        <Routes>
          <Route
            path="/dashboard"
            element={
              role === "user" ? <Dashboard /> : <Navigate to="/" replace />
            }
          />
          {/* FIX: Added '/*' to the path to allow for nested routes */}
          <Route
            path="/transporter-dashboard/*"
            element={
              role === "transporter" ? <TransporterDashboard /> : <Navigate to="/" replace />
            }
          />
          {/* Redirect from root or any other invalid path to the correct dashboard */}
          <Route
            path="*"
            element={
              <Navigate
                to={role === "user" ? "/dashboard" : "/transporter-dashboard"}
                replace
              />
            }
          />
        </Routes>
        <Toaster position="top-center" reverseOrder={false} />
      </>
    );
  }

  // 3. If no one is logged in, only render public routes.
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Any other path for a logged-out user redirects to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
