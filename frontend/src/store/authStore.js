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

    // --- Recycler ---
    loginRecycler: async (data) => {
        set({ loading: true });
        try {
            const res = await axios.post(`${API_URL}/api/recycler/login`, data);
            set({ currentUser: res.data.recycler, role: "recycler", loading: false });
            toast.success("Recycler logged in successfully!");
        } catch (error) {
            console.error("Login recycler failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Recycler login failed!");
            set({ loading: false });
        }
    },

    // --- Logout (Updated) ---
    logout: async () => {
        try {
            set((state) => {
                if (state.role === "user") axios.post(`${API_URL}/api/auth/logout`);
                if (state.role === "transporter") axios.post(`${API_URL}/api/transporter/logout`);
                // --- Recycler ---
                if (state.role === "recycler") axios.post(`${API_URL}/api/recycler/logout`);

                toast.success("Logged out successfully!");
                return { currentUser: null, role: null };
            });
        } catch (error) {
            console.error("Logout failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Logout failed!");
        }
    },

    // --- Check auth (Updated) ---
    checkAuth: async () => {
        try {
            // Check for User
            const userRes = await axios.get(`${API_URL}/api/auth/check-user`);
            set({ currentUser: userRes.data, role: "user", loading: false });
        } catch {
            try {
                // Check for Transporter
                const transRes = await axios.get(`${API_URL}/api/transporter/check-user`);
                set({ currentUser: transRes.data, role: "transporter", loading: false });
            } catch {
                try {
                    // --- Recycler ---
                    // Check for Recycler
                    const recyclerRes = await axios.get(`${API_URL}/api/recycler/check-user`);
                    set({ currentUser: recyclerRes.data, role: "recycler", loading: false });
                } catch {
                    // No one is logged in
                    set({ currentUser: null, role: null, loading: false });
                }
            }
        }
    },
}));
