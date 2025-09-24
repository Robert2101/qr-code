import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";

// Set default axios configuration to send cookies with every request
axios.defaults.withCredentials = true;

// Use environment variable for the API URL with a fallback for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const ADMIN_API_URL = `${API_URL}/api/admin`;

// Define the Zustand store for admin state management
const useAdminStore = create((set, get) => ({
    // --- STATE ---
    revenueRequests: [],
    admin: null,
    isAuthChecked: false,
    loading: {
        stats: false,
        users: false,
        transporters: false,
        recyclers: false,
        requests: false, // For fetching the list of requests
        action: false,   // For approve/decline actions
        details: false,  // For fetching detailed views (user, transporter, etc.)
    },
    stats: {
        userCount: 0,
        transporterCount: 0,
        recyclerCount: 0,
        totalWeightCollected: 0,
    },
    users: [],
    transporters: [],
    recyclers: [],
    currentTransporter: null,
    transporterCollections: [],
    transporterStats: null,
    transporterLocationHistory: null,
    currentRecycler: null,
    recyclerCollections: [],
    recyclerStats: null,

    // --- ACTIONS ---

    // --- Authentication Actions ---
    login: async (credentials) => {
        try {
            const res = await toast.promise(
                axios.post(`${ADMIN_API_URL}/login`, credentials),
                {
                    loading: "Logging in...",
                    success: "Login successful! Welcome back.",
                    error: (err) => err.response?.data?.message || "Login failed!",
                }
            );
            set({ admin: res.data.user, isAuthChecked: true });
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
        }
    },

    logout: async () => {
        try {
            // It's good practice to have a backend logout route to invalidate the session.
            await axios.post(`${ADMIN_API_URL}/logout`);
            // Example: await axios.post(`${ADMIN_API_URL}/logout`);
            toast.success("Logged out successfully.");
        } catch (error) {
            console.error("Logout failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Logout failed!");
        } finally {
            // Always clear client-side state
            set({
                admin: null,
                users: [],
                transporters: [],
                recyclers: [],
                isAuthChecked: true,
                stats: { userCount: 0, transporterCount: 0, recyclerCount: 0, totalWeightCollected: 0 },
            });
        }
    },

    checkAuth: async () => {
        try {
            const res = await axios.get(`${ADMIN_API_URL}/check-user`);
            set({ admin: res.data.user, isAuthChecked: true });
        } catch (error) {
            set({ admin: null, isAuthChecked: true });
        }
    },

    // --- Dashboard Actions ---
    getDashboardStats: async () => {
        set(state => ({ loading: { ...state.loading, stats: true } }));
        try {
            const res = await axios.get(`${ADMIN_API_URL}/stats`);
            set({ stats: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch dashboard stats");
        } finally {
            set(state => ({ loading: { ...state.loading, stats: false } }));
        }
    },

    // --- User Management Actions ---
    getAllUsers: async () => {
        set(state => ({ loading: { ...state.loading, users: true } }));
        try {
            const res = await axios.get(`${ADMIN_API_URL}/users`);
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch users");
        } finally {
            set(state => ({ loading: { ...state.loading, users: false } }));
        }
    },

    getUserById: async (userId) => {
        set(state => ({ loading: { ...state.loading, details: true } }));
        try {
            const res = await axios.get(`${ADMIN_API_URL}/users/${userId}`);
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch user details");
            return null;
        } finally {
            set(state => ({ loading: { ...state.loading, details: false } }));
        }
    },

    getUserCollections: async (userId) => {
        try {
            const res = await axios.get(`${ADMIN_API_URL}/users/${userId}/collections`);
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch user collections");
            return [];
        }
    },

    updateUserById: async (userId, updateData) => {
        try {
            const res = await toast.promise(
                axios.put(`${ADMIN_API_URL}/users/${userId}`, updateData),
                {
                    loading: "Updating user...",
                    success: "User updated successfully!",
                    error: (err) => err.response?.data?.message || "Update failed!",
                }
            );
            set((state) => ({
                users: state.users.map((user) => (user._id === userId ? res.data : user)),
            }));
            return res.data;
        } catch (error) {
            console.error("Update user failed:", error);
            return null;
        }
    },

    // --- Transporter Management ---
    getAllTransporters: async () => {
        set(state => ({ loading: { ...state.loading, transporters: true } }));
        try {
            const res = await axios.get(`${ADMIN_API_URL}/transporters`);
            set({ transporters: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch transporters");
        } finally {
            set(state => ({ loading: { ...state.loading, transporters: false } }));
        }
    },

    createTransporter: async (data) => {
        try {
            await toast.promise(axios.post(`${ADMIN_API_URL}/transporters`, data), {
                loading: "Creating transporter...",
                success: "Transporter created successfully!",
                error: (err) => err.response?.data?.message || "Creation failed!",
            });
            get().getAllTransporters();
        } catch (error) {
            console.error("Create transporter failed:", error.response?.data || error.message);
        }
    },

    updateTransporterById: async (id, updateData) => {
        try {
            const res = await toast.promise(
                axios.put(`${ADMIN_API_URL}/transporters/${id}`, updateData),
                {
                    loading: "Updating transporter...",
                    success: "Transporter updated successfully!",
                    error: (err) => err.response?.data?.message || "Update failed!",
                }
            );
            set((state) => ({
                transporters: state.transporters.map((t) => t._id === id ? res.data : t),
            }));
        } catch (error) {
            console.error("Update transporter failed:", error.response?.data || error.message);
        }
    },

    getTransporterCollections: async (id) => {
        set(state => ({ loading: { ...state.loading, details: true } }));
        try {
            const res = await axios.get(`${ADMIN_API_URL}/transporters/${id}/collections`);
            set({
                currentTransporter: res.data.transporter,
                transporterCollections: res.data.collections,
                transporterStats: res.data.stats,
            });
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch transporter collections");
        } finally {
            set(state => ({ loading: { ...state.loading, details: false } }));
        }
    },

    getTransporterLocationHistory: async (id, date) => {
        set(state => ({ loading: { ...state.loading, details: true } }));
        try {
            let url = `${ADMIN_API_URL}/transporters/${id}/location-history`;
            if (date) url += `?date=${date}`;

            const res = await axios.get(url);
            set({ transporterLocationHistory: res.data });
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch location history");
            set({ transporterLocationHistory: null });
            return null;
        } finally {
            set(state => ({ loading: { ...state.loading, details: false } }));
        }
    },

    // --- Recycler Management ---
    getAllRecyclers: async () => {
        set(state => ({ loading: { ...state.loading, recyclers: true } }));
        try {
            const res = await axios.get(`${ADMIN_API_URL}/recyclers`);
            set({ recyclers: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch recyclers");
        } finally {
            set(state => ({ loading: { ...state.loading, recyclers: false } }));
        }
    },

    getRecyclerCollections: async (id) => {
        set(state => ({ loading: { ...state.loading, details: true } }));
        try {
            const res = await axios.get(`${ADMIN_API_URL}/recyclers/${id}/collections`);
            set({
                currentRecycler: res.data.recycler,
                recyclerCollections: res.data.collections,
                recyclerStats: res.data.stats,
            });
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch recycler collections");
        } finally {
            set(state => ({ loading: { ...state.loading, details: false } }));
        }
    },

    createRecycler: async (data) => {
        try {
            await toast.promise(axios.post(`${ADMIN_API_URL}/recyclers`, data), {
                loading: "Creating recycler...",
                success: "Recycler created successfully!",
                error: (err) => err.response?.data?.message || "Creation failed!",
            });
            get().getAllRecyclers();
        } catch (error) {
            console.error("Create recycler failed:", error.response?.data || error.message);
        }
    },

    updateRecycler: async (id, data) => {
        try {
            const res = await toast.promise(axios.put(`${ADMIN_API_URL}/recyclers/${id}`, data), {
                loading: "Updating recycler...",
                success: "Recycler updated successfully!",
                error: (err) => err.response?.data?.message || "Update failed!",
            });
            set(state => ({
                recyclers: state.recyclers.map(r => r._id === id ? res.data : r)
            }));
        } catch (error) {
            console.error("Update recycler failed:", error);
        }
    },

    // --- Revenue Management ---
    fetchRevenueRequests: async () => {
        set(state => ({ loading: { ...state.loading, requests: true } }));
        try {
            const res = await axios.get(`${ADMIN_API_URL}/revenue-requests`);
            set({ revenueRequests: res.data });
        } catch (err) {
            toast.error("Failed to fetch revenue requests.");
        } finally {
            set(state => ({ loading: { ...state.loading, requests: false } }));
        }
    },

    approveRevenueRequest: async (requestId) => {
        set(state => ({ loading: { ...state.loading, action: true } }));
        try {
            await toast.promise(
                axios.post(`${ADMIN_API_URL}/revenue-requests/${requestId}/approve`),
                {
                    loading: "Approving and processing wallets...",
                    success: "Request approved successfully!",
                    error: "Failed to approve request."
                }
            );
            get().fetchRevenueRequests(); // Refresh list after action
        } catch (err) {
            console.error("Approval failed:", err);
        } finally {
            set(state => ({ loading: { ...state.loading, action: false } }));
        }
    },

    declineRevenueRequest: async (requestId) => {
        set(state => ({ loading: { ...state.loading, action: true } }));
        try {
            await toast.promise(
                axios.post(`${ADMIN_API_URL}/revenue-requests/${requestId}/decline`),
                {
                    loading: "Declining request...",
                    success: "Request has been declined.",
                    error: "Failed to decline request."
                }
            );
            get().fetchRevenueRequests(); // Refresh list after action
        } catch (err) {
            console.error("Decline failed:", err);
        } finally {
            set(state => ({ loading: { ...state.loading, action: false } }));
        }
    },
}));

export default useAdminStore;