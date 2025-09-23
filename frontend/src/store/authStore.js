import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const useAuthStore = create((set) => ({
    currentUser: null,
    role: null,
    loading: true,
    updateCurrentUser: (user) => {
        set({ currentUser: user });
    },
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
            toast.success(res.data.message); // e.g., "An OTP has been sent..."
            return res.data; // Return the response which contains the mobile number
        } catch (error) {
            console.error("Register user failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "User registration failed!");
            throw error; // Throw error to be caught in the component
        }
    },

    // --- NEW function to verify OTP and login ---
    verifyOtpAndLogin: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/verify-otp`, data);
            // On successful verification, the backend sends back the user data and token (in a cookie)
            set({ currentUser: res.data.user, role: "user" });
            toast.success("Account verified successfully!");
            return res.data;
        } catch (error) {
            console.error("OTP Verification failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "OTP Verification failed!");
            throw error;
        }
    },

    sendPasswordResetOtp: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/forgot-password`, data);
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            console.error("Forgot Password failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to send OTP!");
            throw error;
        }
    },

    resetPasswordWithOtp: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/reset-password`, data);
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            console.error("Reset Password failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to reset password!");
            throw error;
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

    sendTransporterPasswordResetOtp: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/transporter/forgot-password`, data);
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            console.error("Transporter Forgot Password failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to send OTP!");
            throw error;
        }
    },
    resetTransporterPasswordWithOtp: async (data) => {
        try {
            const res = await axios.post(`${API_URL}/api/transporter/reset-password`, data);
            toast.success(res.data.message);
            return res.data;
        } catch (error) {
            console.error("Transporter Reset Password failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to reset password!");
            throw error;
        }
    },

    // --- Recycler ---
    loginRecycler: async (data) => {
        set({ loading: true });
        try {
            const res = await axios.post(`${API_URL}/api/recycler/login`, data);
            console.log("✅ Recycler Login Response:", res.data);
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
                if (state.role === "recycler") axios.post(`${API_URL}/api/recycler/logout`);

                toast.success("Logged out successfully!");
                return { currentUser: null, role: null };
            });
        } catch (error) {
            console.error("Logout failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Logout failed!");
        }
    },

    // --- checkAuth (Added Detailed Logging) ---
    checkAuth: async () => {
        console.log("--- Starting authentication check ---");
        set({ loading: true });

        const authChecks = [
            { role: "user", url: `${API_URL}/api/auth/check-user`, key: "user" },
            { role: "transporter", url: `${API_URL}/api/transporter/check-user`, key: "transporter" },
            { role: "recycler", url: `${API_URL}/api/recycler/check-user`, key: "recycler" },
        ];

        for (const check of authChecks) {
            console.log(`[checkAuth] Attempting to authenticate as: ${check.role}`);
            try {
                const res = await axios.get(check.url);
                console.log(`[checkAuth] Response for ${check.role}:`, res.data); // Log the actual response data

                if (res.data && res.data[check.key]) {
                    console.log(`✅ [checkAuth] Success! Authenticated as ${check.role}.`);
                    set({
                        currentUser: res.data[check.key],
                        role: check.role,
                        loading: false,
                    });
                    console.log("[checkAuth] State updated. Halting further checks.");
                    return;
                } else {
                    console.log(`[checkAuth] Check for ${check.role} succeeded but no user data found in response.`);
                }
            } catch (error) {
                console.error(`❌ [checkAuth] Auth check failed for role: ${check.role}.`);
                if (error.response) {
                    // The request was made and the server responded with a status code
                    console.error('[checkAuth] Error data:', error.response.data);
                    console.error('[checkAuth] Error status:', error.response.status);
                } else if (error.request) {
                    // The request was made but no response was received
                    console.error('[checkAuth] No response received:', error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.error('[checkAuth] Error setting up request:', error.message);
                }
            }
        }

        // If the loop completes without finding any authenticated user
        console.log("--- All auth checks completed. No user authenticated. Setting logged out state. ---");
        set({ currentUser: null, role: null, loading: false });
    },
}));