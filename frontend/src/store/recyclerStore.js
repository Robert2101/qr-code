import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore"; // Adjust path if needed
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useRecyclerStore = create((set) => ({
    scanResult: null,
    loading: {
        profile: false,
        scan: false,
    },
    error: null,

    // Action to update the recycler's profile
    updateProfile: async (profileData) => {
        try {
            set((state) => ({ loading: { ...state.loading, profile: true }, error: null }));

            const res = await axios.put(`${API_URL}/api/recycler/update-profile`, profileData);

            // Update the currentUser in the authStore with the new data
            useAuthStore.setState({ currentUser: res.data.recycler });

            set((state) => ({
                loading: { ...state.loading, profile: false },
            }));

            toast.success("Profile updated successfully!");
            return res.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to update profile";
            set((state) => ({
                error: errorMsg,
                loading: { ...state.loading, profile: false },
            }));
            toast.error(errorMsg);
        }
    },

    // Action to handle scanning a transporter's QR code
    scanQRCode: async (scannedTransporterId) => {
        try {
            set((state) => ({ loading: { ...state.loading, scan: true }, error: null, scanResult: null }));

            const res = await axios.post(`${API_URL}/api/recycler/scan`, { scannedTransporterId });

            set((state) => ({
                scanResult: res.data,
                loading: { ...state.loading, scan: false },
            }));

            toast.success(res.data.message);
            return res.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to process QR code scan";
            set((state) => ({
                error: errorMsg,
                loading: { ...state.loading, scan: false },
            }));
            toast.error(errorMsg);
        }
    },
    fetchHistory: async () => {
        try {
            set((state) => ({ loading: { ...state.loading, history: true }, error: null }));
            const res = await axios.get(`${API_URL}/api/recycler/history`);
            set((state) => ({
                history: res.data.history,
                loading: { ...state.loading, history: false },
            }));
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to fetch history";
            set((state) => ({
                error: errorMsg,
                loading: { ...state.loading, history: false },
            }));
            toast.error(errorMsg);
        }
    },
}));