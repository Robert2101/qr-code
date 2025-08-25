import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TransporterDashboard from "./pages/TransporterDashboard";

import { Toaster } from "react-hot-toast";

function App() {
  const { currentUser, role, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) return <h2>Loading...</h2>;

  return (
    <>
      <Routes>
        {/* Root */}
        <Route
          path="/"
          element={
            !currentUser ? (
              <Home />
            ) : role === "user" ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/transporter-dashboard" />
            )
          }
        />


        <Route
          path="/register"
          element={!currentUser ? <Register /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!currentUser ? <Login /> : <Navigate to="/" />}
        />


        <Route
          path="/dashboard"
          element={currentUser && role === "user" ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/transporter-dashboard"
          element={
            currentUser && role === "transporter" ? (
              <TransporterDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      <Toaster />
    </>
    
  );
}

export default App;
