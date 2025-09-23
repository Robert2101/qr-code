import { useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import useAdminStore from "../store/adminStore.js";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [loading, setLoading] = useState(false);

    const { loginUser, loginTransporter, loginRecycler } = useAuthStore();
    const { login: loginAdmin } = useAdminStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const credentials = { loginId, password };
            const adminCredentials = { email: loginId, password };

            if (role === "user") {
                await loginUser(credentials);
                navigate("/dashboard");
            } else if (role === "transporter") {
                await loginTransporter(credentials);
                navigate("/transporter-dashboard");
            } else if (role === "recycler") {
                await loginRecycler(credentials);
                navigate("/recycler-dashboard");
            } else if (role === "admin") {
                await loginAdmin(adminCredentials);
                navigate("/admin/dashboard");
            }
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div key={i} className="absolute rounded-full bg-green-200 opacity-20"
                        style={{
                            width: Math.random() * 100 + 50, height: Math.random() * 100 + 50,
                            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                        }}
                        animate={{ y: [0, Math.random() * 20 - 10], x: [0, Math.random() * 20 - 10] }}
                        transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, repeatType: "reverse" }} />
                ))}
            </div>

            <div className="container mx-auto max-w-6xl">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/2 bg-gradient-to-br from-green-400 to-blue-500 p-8 md:p-12 flex flex-col justify-center relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <motion.div className="relative z-10 text-white" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to EcoChain</h1>
                            <p className="text-lg mb-6">Smart Waste Management System</p>
                            <div className="space-y-4 mt-8">
                                {[
                                    { icon: "🔍", text: "QR Code Validation" }, { icon: "🗺️", text: "Real-time Tracking" },
                                    { icon: "📊", text: "Advanced Analytics" }, { icon: "♻️", text: "Recycling Management" }
                                ].map((item, index) => (
                                    <motion.div key={index} className="flex items-center" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}>
                                        <span className="text-2xl mr-3">{item.icon}</span><span>{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                    <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center">
                        <motion.form onSubmit={handleSubmit} className="w-full max-w-md space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                            <motion.div variants={itemVariants} className="text-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><span className="text-2xl">🔐</span></div>
                                <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2><p className="text-gray-600 mt-2">Sign in to your account</p>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[{ value: "user", label: "User", icon: "👤" }, { value: "transporter", label: "Transporter", icon: "🚚" }, { value: "recycler", label: "Recycler", icon: "♻️" }, { value: "admin", label: "Admin", icon: "⚙️" }
                                    ].map((option) => (
                                        <button key={option.value} type="button" onClick={() => setRole(option.value)} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${role === option.value ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"}`}>
                                            <span className="text-2xl mb-1">{option.icon}</span><span className="font-medium text-sm">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email or Mobile Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-400">📧</span></div>
                                    <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="Enter your email or mobile" className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-400">🔒</span></div>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
                                </div>
                            </motion.div>

                            {(role === 'user' || role === 'transporter') && (
                                <motion.div variants={itemVariants} className="text-right text-sm">
                                    <Link to="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                                        Forgot your password?
                                    </Link>
                                </motion.div>
                            )}

                            <motion.div variants={itemVariants}>
                                <motion.button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center disabled:bg-gray-400" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <span>{loading ? 'Logging in...' : 'Login to Continue'}</span><span className="ml-2">{loading ? '⏳' : '→'}</span>
                                </motion.button>
                            </motion.div>
                            <motion.div variants={itemVariants} className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">New to EcoChain?</span></div>
                            </motion.div>
                            <motion.div variants={itemVariants} className="text-center">
                                <Link to="/register" className="inline-block px-4 py-2 text-green-600 font-medium hover:text-green-700 transition duration-200">
                                    Create an account
                                </Link>
                            </motion.div>
                        </motion.form>
                    </div>
                </div>
            </div>
        </div>
    );
}

