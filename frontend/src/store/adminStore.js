import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";
import axios from "axios";

// 1. Axios instance
const apiClient = axios.create({
    baseURL: "http://localhost:5001/api/admin",
    withCredentials: true,
});

// 2. Interceptor for error handling
apiClient.interceptors.response.use(
    (res) => res.data,
    (err) => {
        const message =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Something went wrong";
        return Promise.reject(new Error(message));
    }
);

const useAdminStore = create(
    persist(
        (set, get) => ({
            // --- STATE ---
            admin: null,
            stats: {
                userCount: 0,
                transporterCount: 0,
                recyclerCount: 0,
                totalWeightCollected: 0,
            },
            users: [],
            transporters: [],
            recyclers: [],
            loading: false,

            // --- AUTH ---
            login: async (credentials) => {
                try {
                    const data = await toast.promise(apiClient.post("/login", credentials), {
                        loading: "Logging in...",
                        success: "Login successful! 🎉",
                        error: (err) => err.toString(),
                    });
                    set({ admin: data.user });
                } catch (_) { }
            },

            logout: () => {
                set({
                    admin: null,
                    users: [],
                    transporters: [],
                    recyclers: [],
                    stats: {
                        userCount: 0,
                        transporterCount: 0,
                        recyclerCount: 0,
                        totalWeightCollected: 0,
                    },
                });
                toast.success("Logged out successfully.");
            },

            // --- DASHBOARD ---
            getDashboardStats: async () => {
                set({ loading: true });
                try {
                    const stats = await apiClient.get("/stats");
                    set({ stats });
                } catch (err) {
                    toast.error(`Stats fetch failed: ${err.message}`);
                } finally {
                    set({ loading: false });
                }
            },

            // --- USERS ---
            getAllUsers: async () => {
                set({ loading: true });
                try {
                    const users = await apiClient.get("/users");
                    set({ users });
                } catch (err) {
                    toast.error(`Failed to fetch users: ${err.message}`);
                } finally {
                    set({ loading: false });
                }
            },

            updateUserById: async (userId, updateData) => {
                try {
                    const updatedUser = await toast.promise(
                        apiClient.put(`/users/${userId}`, updateData),
                        {
                            loading: "Updating user...",
                            success: "User updated ✅",
                            error: (err) => `Update failed: ${err.toString()}`,
                        }
                    );
                    set((state) => ({
                        users: state.users.map((u) =>
                            u._id === userId ? updatedUser : u
                        ),
                    }));
                } catch (_) { }
            },

            // --- TRANSPORTERS ---
            getAllTransporters: async () => {
                set({ loading: true });
                try {
                    const transporters = await apiClient.get("/transporters");
                    set({ transporters });
                } catch (err) {
                    toast.error(`Failed to fetch transporters: ${err.message}`);
                } finally {
                    set({ loading: false });
                }
            },

            createTransporter: async (data) => {
                try {
                    await toast.promise(apiClient.post("/transporters", data), {
                        loading: "Creating transporter...",
                        success: "Transporter created ✅",
                        error: (err) => `Creation failed: ${err.toString()}`,
                    });
                    get().getAllTransporters();
                } catch (_) { }
            },

            updateTransporterById: async (id, updateData) => {
                try {
                    const updated = await toast.promise(
                        apiClient.put(`/transporters/${id}`, updateData),
                        {
                            loading: "Updating transporter...",
                            success: "Transporter updated ✅",
                            error: (err) => `Update failed: ${err.toString()}`,
                        }
                    );
                    set((s) => ({
                        transporters: s.transporters.map((t) =>
                            t._id === id ? updated : t
                        ),
                    }));
                } catch (_) { }
            },

            // --- RECYCLERS ---
            getAllRecyclers: async () => {
                set({ loading: true });
                try {
                    const recyclers = await apiClient.get("/recyclers");
                    set({ recyclers });
                } catch (err) {
                    toast.error(`Failed to fetch recyclers: ${err.message}`);
                } finally {
                    set({ loading: false });
                }
            },

            createRecycler: async (data) => {
                try {
                    await toast.promise(apiClient.post("/recyclers", data), {
                        loading: "Creating recycler...",
                        success: "Recycler created ✅",
                        error: (err) => `Creation failed: ${err.toString()}`,
                    });
                    get().getAllRecyclers();
                } catch (_) { }
            },
        }),
        {
            name: "admin-auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ admin: state.admin }), // only persist admin
        }
    )
);

export default useAdminStore;
