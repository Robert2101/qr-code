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
    admin: null,
    isAuthChecked: false, // Tracks if the initial authentication check is complete
    loading: false,
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

    // --- FIXED checkAuth function ---
    checkAuth: async () => {
        try {
            // Call the new endpoint that returns the admin user data if the session is valid
            const res = await axios.get(`${ADMIN_API_URL}/check-user`);
            // Set the admin state with the user data from the response
            set({ admin: res.data.user, isAuthChecked: true });
        } catch (error) {
            // If the request fails, it means the session is invalid or expired.
            set({ admin: null, isAuthChecked: true });
        }
    },

    // --- Dashboard Actions ---
    getDashboardStats: async () => {
        set({ loading: true });
        try {
            const res = await axios.get(`${ADMIN_API_URL}/stats`);
            set({ stats: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch dashboard stats");
            console.error("Fetch stats failed:", error.response?.data || error.message);
        } finally {
            set({ loading: false });
        }
    },

    // --- User Management Actions ---
    getAllUsers: async () => {
        set({ loading: true });
        try {
            const res = await axios.get(`${ADMIN_API_URL}/users`);
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch users");
            console.error("Fetch users failed:", error.response?.data || error.message);
        } finally {
            set({ loading: false });
        }
    },

    getUserById: async (userId) => {
        set({ loading: true });
        try {
            const res = await axios.get(`${ADMIN_API_URL}/users/${userId}`);
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch user details");
            console.error("Fetch user details failed:", error.response?.data || error.message);
            return null;
        } finally {
            set({ loading: false });
        }
    },

    getUserCollections: async (userId) => {
        set({ loading: true });
        try {
            const res = await axios.get(`${ADMIN_API_URL}/users/${userId}/collections`);
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch user collections");
            console.error("Fetch user collections failed:", error.response?.data || error.message);
            return [];
        } finally {
            set({ loading: false });
        }
    },

    updateUserById: async (userId, updateData) => {
        set({ loading: true });
        try {
            const res = await toast.promise(
                axios.put(`${ADMIN_API_URL}/users/${userId}`, updateData),
                {
                    loading: "Updating user...",
                    success: "User updated successfully!",
                    error: (err) => err.response?.data?.message || "Failed to update user",
                }
            );
            // Update the users array with the updated user
            set((state) => ({
                users: state.users.map((user) => (user._id === userId ? res.data : user)),
            }));
        } catch (error) {
            console.error("Update user failed:", error.response?.data || error.message);
        } finally {
            set({ loading: false });
        }
    },

    // --- Transporter Management ---
    getAllTransporters: async () => {
        set({ loading: true });
        try {
            const res = await axios.get(`${ADMIN_API_URL}/transporters`);
            set({ transporters: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch transporters");
            console.error("Fetch transporters failed:", error.response?.data || error.message);
        } finally {
            set({ loading: false });
        }
    },

    createTransporter: async (data) => {
        try {
            await toast.promise(axios.post(`${ADMIN_API_URL}/transporters`, data), {
                loading: "Creating transporter...",
                success: "Transporter created successfully!",
                error: (err) => err.response?.data?.message || "Creation failed!",
            });
            get().getAllTransporters(); // Refresh the list after creation
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
        set({ loading: true });
        try {
            const res = await axios.get(`${ADMIN_API_URL}/transporters/${id}/collections`);
            set({ 
                currentTransporter: res.data.transporter,
                transporterCollections: res.data.collections,
                transporterStats: res.data.stats,
                loading: false
            });
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch transporter collections");
            console.error("Fetch transporter collections failed:", error.response?.data || error.message);
            set({ loading: false });
        }
    },

    // --- Recycler Management ---
    getAllRecyclers: async () => {
        set({ loading: true });
        try {
            const res = await axios.get(`${ADMIN_API_URL}/recyclers`);
            set({ recyclers: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch recyclers");
            console.error("Fetch recyclers failed:", error.response?.data || error.message);
        } finally {
            set({ loading: false });
        }
    },
    
    getRecyclerCollections: async (id) => {
        set({ loading: true });
        try {
            const res = await axios.get(`${ADMIN_API_URL}/recyclers/${id}/collections`);
            set({ 
                currentRecycler: res.data.recycler,
                recyclerCollections: res.data.collections,
                recyclerStats: res.data.stats,
                loading: false
            });
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch recycler collections");
            console.error("Fetch recycler collections failed:", error.response?.data || error.message);
            set({ loading: false });
        }
    },
    
    createRecycler: async (data) => {
        try {
            await toast.promise(axios.post(`${ADMIN_API_URL}/recyclers`, data), {
                loading: "Creating recycler...",
                success: "Recycler created successfully!",
                error: (err) => err.response?.data?.message || "Creation failed!",
            });
            get().getAllRecyclers(); // Refresh the list after creation
        } catch (error) {
            console.error("Create recycler failed:", error.response?.data || error.message);
        }
    },
    
    updateRecycler: async (id, data) => {
        try {
            await toast.promise(axios.put(`${ADMIN_API_URL}/recyclers/${id}`, data), {
                loading: "Updating recycler...",
                success: "Recycler updated successfully!",
                error: (err) => err.response?.data?.message || "Update failed!",
            });
            get().getAllRecyclers(); // Refresh the list after update
        } catch (error) {
            console.error("Update recycler failed:", error.response?.data || error.message);
        }
    },
}));

export default useAdminStore;
