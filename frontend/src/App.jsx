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
import RecyclerDashboard from "./pages/RecyclerDashboard"; // Import the new dashboard

import { Toaster } from "react-hot-toast";

function App() {
  const { currentUser, role, loading: authLoading, checkAuth } = useAuthStore();
  const { admin, isAuthChecked: isAdminAuthChecked, checkAuth: checkAdminAuth } = useAdminStore();

  useEffect(() => {
    checkAuth();
    checkAdminAuth();
  }, [checkAuth, checkAdminAuth]);

  if (authLoading || !isAdminAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-semibold">Loading...</h2>
      </div>
    );
  }

  // --- ROUTING LOGIC ---

  // 1. Admin Routes
  if (admin) {
    return (
      <>
        <Routes>
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
        <Toaster position="top-center" reverseOrder={false} />
      </>
    );
  }

  // 2. Logged-in User, Transporter, or Recycler Routes
  if (currentUser) {
    const getDashboardPath = () => {
      switch (role) {
        case "user":
          return "/dashboard";
        case "transporter":
          return "/transporter-dashboard";
        case "recycler":
          return "/recycler-dashboard";
        default:
          return "/";
      }
    };

    return (
      <>
        <Routes>
          <Route
            path="/dashboard"
            element={
              role === "user" ? <Dashboard /> : <Navigate to={getDashboardPath()} replace />
            }
          />
          <Route
            path="/transporter-dashboard/*"
            element={
              role === "transporter" ? <TransporterDashboard /> : <Navigate to={getDashboardPath()} replace />
            }
          />
          {/* --- NEW RECYCLER ROUTE --- */}
          <Route
            path="/recycler-dashboard/*"
            element={
              role === "recycler" ? <RecyclerDashboard /> : <Navigate to={getDashboardPath()} replace />
            }
          />
          {/* Redirect from root or any other invalid path to the correct dashboard */}
          <Route
            path="*"
            element={<Navigate to={getDashboardPath()} replace />}
          />
        </Routes>
        <Toaster position="top-center" reverseOrder={false} />
      </>
    );
  }

  // 3. Public (Logged-out) Routes
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
