import React from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const TransporterDashboard = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login"); // redirect to login page
    };

    return (
        <div>
            <h1>Transporter Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default TransporterDashboard;
