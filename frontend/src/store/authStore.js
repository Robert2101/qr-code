import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useAuthStore = create((set) => ({
    currentUser: null, // can be user or transporter
    role: null,        // "user" | "transporter" | null
    loading: true,

    // --- User login/register ---
    loginUser: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, data);
            set({ currentUser: res.data.user, role: "user" });
        } catch (error) {
            console.error("Login user failed:", error.response?.data || error.message);
        }
    },

    registerUser: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, data);
            set({ currentUser: res.data.user, role: "user" });
        } catch (error) {
            console.error("Register user failed:", error.response?.data || error.message);
        }
    },

    // --- Transporter login/register ---
    loginTransporter: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/transporter/login`, data);
            set({ currentUser: res.data.transporter, role: "transporter" });
        } catch (error) {
            console.error("Login transporter failed:", error.response?.data || error.message);
        }
    },

    registerTransporter: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/transporter/register`, data);
            set({ currentUser: res.data.transporter, role: "transporter" });
        } catch (error) {
            console.error("Register transporter failed:", error.response?.data || error.message);
        }
    },

    logout: async () => {
        try {
            set((state) => {
                if (state.role === "user") axios.post(`${API_URL}/api/auth/logout`);
                if (state.role === "transporter") axios.post(`${API_URL}/api/transporter/logout`);
                return { currentUser: null, role: null };
            });
        } catch (error) {
            console.error("Logout failed:", error.response?.data || error.message);
        }
    },



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
