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

    checkAuth: async () => {
        set({ loading: true });

        try {
            // 1. First, try to authenticate as a "user"
            const userRes = await axios.get(`${API_URL}/api/auth/check-user`);
            if (userRes.data && userRes.data.user) {
                // SUCCESS: Found a user. Set state in one call and finish.
                console.log("Authenticated as User.");
                set({
                    currentUser: userRes.data.user,
                    role: "user",
                    loading: false,
                });
                return; // Stop execution here
            }
        } catch (userError) {
            // FAILED: Not a user. Log it and proceed to the next check.
            console.log("Auth check failed for role: user");

            try {
                // 2. Second, try to authenticate as a "transporter"
                const transporterRes = await axios.get(`${API_URL}/api/transporter/check-user`);
                if (transporterRes.data && transporterRes.data.transporter) {
                    // SUCCESS: Found a transporter. Set state in one call and finish.
                    console.log("Authenticated as Transporter.");
                    set({
                        currentUser: transporterRes.data.transporter,
                        role: "transporter",
                        loading: false,
                    });
                    return; // Stop execution here
                }
            } catch (transporterError) {
                // FAILED: Not a transporter. Log it and proceed.
                console.log("Auth check failed for role: transporter");

                try {
                    // 3. Third, try to authenticate as a "recycler"
                    const recyclerRes = await axios.get(`${API_URL}/api/recycler/check-user`);
                    if (recyclerRes.data && recyclerRes.data.recycler) {
                        // SUCCESS: Found a recycler. Set state in one call and finish.
                        console.log("Authenticated as Recycler.");
                        set({
                            currentUser: recyclerRes.data.recycler,
                            role: "recycler",
                            loading: false,
                        });
                        return; // Stop execution here
                    }
                } catch (recyclerError) {
                    // FAILED: Not a recycler. Log it and fall through to the final state update.
                    console.log("Auth check failed for role: recycler");
                }
            }
        }

        // 4. If none of the above checks succeeded, set the final "logged out" state.
        console.log("All auth checks failed. Setting logged out state.");
        set({ currentUser: null, role: null, loading: false });
    },
}));
