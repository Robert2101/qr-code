import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const TRANSPORTER_API_URL = `${API_URL}/api/transporter`;

export const useTransporterStore = create((set) => ({
    collections: [],
    qrCodeUrl: null, // New state for the QR code
    loading: {
        scan: false,
        collections: false,
        profile: false,
        qrCode: false, // New loading state for QR code
    },
    error: null,

    // 🚚 Scan collection (QR or manual)
    scan: async (scanData) => {
        try {
            set((state) => ({ loading: { ...state.loading, scan: true }, error: null }));
            const res = await axios.post(`${TRANSPORTER_API_URL}/scan`, scanData);

            set((state) => ({
                collections: [res.data.collection, ...state.collections],
                loading: { ...state.loading, scan: false },
            }));

            toast.success("Collection scanned successfully ✅");
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.message || "Scan failed";
            set((state) => ({
                error: msg,
                loading: { ...state.loading, scan: false },
            }));
            toast.error(msg);
        }
    },

    // 📝 Update transporter profile
    updateProfile: async (profileData) => {
        try {
            set((state) => ({ loading: { ...state.loading, profile: true }, error: null }));
            const res = await axios.put(`${TRANSPORTER_API_URL}/update-profile`, profileData);

            // keep auth store in sync
            useAuthStore.setState({ currentUser: res.data.transporter });

            set((state) => ({
                loading: { ...state.loading, profile: false },
            }));

            toast.success("Profile updated successfully ✅");
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update profile";
            set((state) => ({
                error: msg,
                loading: { ...state.loading, profile: false },
            }));
            toast.error(msg);
        }
    },

    // 📷 Get Transporter QR Code
    getQrCode: async () => {
        try {
            set((state) => ({ loading: { ...state.loading, qrCode: true }, error: null }));
            const res = await axios.get(`${TRANSPORTER_API_URL}/qr`);
            set((state) => ({
                qrCodeUrl: res.data.qrCodeUrl,
                loading: { ...state.loading, qrCode: false },
            }));
        } catch (err) {
            // Don't show error toast if QR code is not found but still set the error in state
            const msg = err.response?.data?.message || "Failed to fetch QR code";
            set((state) => ({
                error: msg,
                loading: { ...state.loading, qrCode: false },
            }));
            // Only show toast for network errors, not for QR code not found
            if (!err.response || err.response.status !== 404) {
                toast.error(msg);
            }
        }
    }
}));
