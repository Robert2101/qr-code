import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";   // ✅ toast added
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

            toast.success("Collection scanned successfully ✅"); // 🎉 success toast
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.message || "Scan failed";
            set((state) => ({
                error: msg,
                loading: { ...state.loading, scan: false },
            }));
            toast.error(msg); // ❌ error toast
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

            toast.success("Profile updated successfully ✅"); // 🎉 success toast
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update profile";
            set((state) => ({
                error: msg,
                loading: { ...state.loading, profile: false },
            }));
            toast.error(msg); // ❌ error toast
        }
    },
}));