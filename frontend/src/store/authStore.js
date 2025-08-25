import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useAuthStore = create((set) => ({
    currentUser: null,
    role: null,
    loading: true,

    // --- User login/register ---
    loginUser: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, data);
            set({ currentUser: res.data.user, role: "user" });
            toast.success("User logged in successfully!");
        } catch (error) {
            console.error("Login user failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "User login failed!");
        }
    },

    registerUser: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, data);
            set({ currentUser: res.data.user, role: "user" });
            toast.success("User registered successfully!");
        } catch (error) {
            console.error("Register user failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "User registration failed!");
        }
    },

    // --- Transporter login/register ---
    loginTransporter: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/transporter/login`, data);
            set({ currentUser: res.data.transporter, role: "transporter" });
            toast.success("Transporter logged in successfully!");
        } catch (error) {
            console.error("Login transporter failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Transporter login failed!");
        }
    },

    registerTransporter: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/transporter/register`, data);
            set({ currentUser: res.data.transporter, role: "transporter" });
            toast.success("Transporter registered successfully!");
        } catch (error) {
            console.error("Register transporter failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Transporter registration failed!");
        }
    },

    // --- Logout ---
    logout: async () => {
        try {
            set((state) => {
                if (state.role === "user") axios.post(`${API_URL}/api/auth/logout`);
                if (state.role === "transporter") axios.post(`${API_URL}/api/transporter/logout`);
                toast.success("Logged out successfully!");
                return { currentUser: null, role: null };
            });
        } catch (error) {
            console.error("Logout failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Logout failed!");
        }
    },

    // --- Check auth ---
    checkAuth: async () => {
        try {
            const userRes = await axios.get(`${API_URL}/api/auth/check-user`);
            set({ currentUser: userRes.data.user, role: "user", loading: false });
        } catch {
            try {
                const transRes = await axios.get(`${API_URL}/api/transporter/check-user`);
                set({ currentUser: transRes.data.transporter, role: "transporter", loading: false });
            } catch {
                set({ currentUser: null, role: null, loading: false });
            }
        }
    },
}));