import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore"; // <-- adjust path if needed
import toast from "react-hot-toast";
axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useUserStore = create((set) => ({
    qrCodeUrl: null,
    collections: [],
    walletBalance: 0,
    loading: {
        profile: false,
        qr: false,
        collections: false,
        wallet: false,
    },
    error: null,

    updateProfile: async (profileData) => {
        try {
            set((state) => ({ loading: { ...state.loading, profile: true }, error: null }));
            const res = await axios.put(`${API_URL}/api/auth/update-profile`, profileData);

            useAuthStore.setState({ currentUser: res.data.user });

            set((state) => ({
                loading: { ...state.loading, profile: false },
            }));
            toast.success("Profile updated successfully ✅"); 
            return res.data;
        } catch (err) {
            set((state) => ({
                error: err.response?.data?.message || "Failed to update profile",
                loading: { ...state.loading, profile: false },
            }));
            toast.error(msg);
        }
    },

    // ✅ Fetch QR Code
    fetchQR: async () => {
        try {
            set((state) => ({ loading: { ...state.loading, qr: true }, error: null }));
            const res = await axios.get(`${API_URL}/api/auth/qr`);
            set((state) => ({
                qrCodeUrl: res.data.qrCodeUrl,
                loading: { ...state.loading, qr: false },
            }));
            return res.data;
        } catch (err) {
            set((state) => ({
                error: err.response?.data?.message || "Failed to fetch QR",
                loading: { ...state.loading, qr: false },
            }));
        }
    },

    // ✅ Fetch Collections
    fetchCollections: async () => {
        try {
            set((state) => ({ loading: { ...state.loading, collections: true }, error: null }));
            const res = await axios.get(`${API_URL}/api/auth/collections`);
            set((state) => ({
                collections: res.data.collections,
                loading: { ...state.loading, collections: false },
            }));
            return res.data;
        } catch (err) {
            set((state) => ({
                error: err.response?.data?.message || "Failed to fetch collections",
                loading: { ...state.loading, collections: false },
            }));
        }
    },

    // ✅ Fetch Wallet Balance
    fetchWallet: async () => {
        try {
            set((state) => ({ loading: { ...state.loading, wallet: true }, error: null }));
            const res = await axios.get(`${API_URL}/api/auth/wallet`);
            set((state) => ({
                walletBalance: res.data.walletBalance,
                loading: { ...state.loading, wallet: false },
            }));
            return res.data;
        } catch (err) {
            set((state) => ({
                error: err.response?.data?.message || "Failed to fetch wallet balance",
                loading: { ...state.loading, wallet: false },
            }));
        }
    },
}));