import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useTransporterStore = create((set) => ({
    collections: [],
    loading: {
        scan: false,
        collections: false,
        history: false,
        profile: false,
    },
    error: null,

    // 🚚 Scan collection (QR or manual)
    scan: async (scanData) => {
        try {
            set((state) => ({ loading: { ...state.loading, scan: true }, error: null }));
            const res = await axios.post(`${API_URL}/api/transporter/scan`, scanData);

            // add latest collection at top
            set((state) => ({
                collections: [res.data.collection, ...state.collections],
                loading: { ...state.loading, scan: false },
            }));

            return res.data;
        } catch (err) {
            set((state) => ({
                error: err.response?.data?.message || "Scan failed",
                loading: { ...state.loading, scan: false },
            }));
        }
    },


    // 📝 Update transporter profile
    updateProfile: async (profileData) => {
        try {
            set((state) => ({ loading: { ...state.loading, profile: true }, error: null }));
            const res = await axios.put(`${API_URL}/api/transporter/update-profile`, profileData);

            // keep auth store in sync
            useAuthStore.setState({ currentUser: res.data.transporter });

            set((state) => ({
                loading: { ...state.loading, profile: false },
            }));
            return res.data;
        } catch (err) {
            set((state) => ({
                error: err.response?.data?.message || "Failed to update profile",
                loading: { ...state.loading, profile: false },
            }));
        }
    },
}));