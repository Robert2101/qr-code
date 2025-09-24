import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore"; // Adjust path if needed
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const RECYCLER_API_URL = "http://localhost:5001/api/recycler"

export const useRecyclerStore = create((set) => ({
    history: [],
    pendingSummary: null,
    revenueRequests: [],
    loading: {
        history: false,
        scan: false,
        pending: false,
        submit: false,
    },
    error: null,
    scanResult: null,

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
    fetchPendingCollections: async () => {
        set(state => ({ loading: { ...state.loading, pending: true } }));
        try {
            const res = await axios.get(`${RECYCLER_API_URL}/pending-collections`);
            set({ pendingSummary: res.data.summary });
        } catch (err) {
            toast.error("Failed to fetch pending collections.");
            console.log(err);
        } finally {
            set(state => ({ loading: { ...state.loading, pending: false } }));
        }
    },

    submitRevenueRequest: async (data) => {
        set(state => ({ loading: { ...state.loading, submit: true } }));
        try {
            const res = await axios.post(`${RECYCLER_API_URL}/submit-revenue-request`, data);
            toast.success("Revenue request submitted successfully!");
            set({ pendingSummary: null });

        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit request.");
            throw err; // Allow the component to catch the error if needed
        } finally {
            set(state => ({ loading: { ...state.loading, submit: false } }));
        }
    },
}));