import { useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import useAdminStore from "../store/adminStore.js"; // Import the admin store
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); // Default role

    // Get login functions from both stores
    const { loginUser, loginTransporter } = useAuthStore();
    const { login: loginAdmin } = useAdminStore();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle login based on the selected role
        if (role === "user") {
            await loginUser({ email, password });
            navigate("/dashboard");
        } else if (role === "transporter") {
            await loginTransporter({ email, password });
            navigate("/transporter-dashboard");
        } else if (role === "admin") {
            await loginAdmin({ email, password });
            navigate("/admin/dashboard");
        }
    };

    // Animation variants (no changes here)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-green-200 opacity-20"
                        style={{
                            width: Math.random() * 100 + 50,
                            height: Math.random() * 100 + 50,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, Math.random() * 20 - 10],
                            x: [0, Math.random() * 20 - 10],
                        }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto max-w-6xl">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                    {/* Left side - Illustration */}
                    <div className="md:w-1/2 bg-gradient-to-br from-green-400 to-blue-500 p-8 md:p-12 flex flex-col justify-center relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <motion.div
                            className="relative z-10 text-white"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to EcoTrack</h1>
                            <p className="text-lg mb-6">Smart Waste Management System</p>
                            <div className="space-y-4 mt-8">
                                {[
                                    { icon: "🔍", text: "QR Code Validation" },
                                    { icon: "🗺️", text: "Real-time Tracking" },
                                    { icon: "📊", text: "Advanced Analytics" },
                                    { icon: "♻", text: "Recycling Management" }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center"
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                                    >
                                        <span className="text-2xl mr-3">{item.icon}</span>
                                        <span>{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right side - Login Form */}
                    <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center">
                        <motion.form
                            onSubmit={handleSubmit}
                            className="w-full max-w-md space-y-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div variants={itemVariants} className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">🔐</span>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                                <p className="text-gray-600 mt-2">Sign in to your account</p>
                            </motion.div>

                            {/* Role Selector - UPDATED */}
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    I am a
                                </label>
                                <div className="flex space-x-2 sm:space-x-4">
                                    {[
                                        { value: "user", label: "User", icon: "👤" },
                                        { value: "transporter", label: "Transporter", icon: "🚚" },
                                        { value: "admin", label: "Admin", icon: "⚙️" } // Added Admin role
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setRole(option.value)}
                                            className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${role === option.value
                                                ? "border-green-500 bg-green-50 text-green-700"
                                                : "border-gray-200 text-gray-500 hover:border-green-300"
                                                }`}
                                        >
                                            <span className="text-2xl mb-2">{option.icon}</span>
                                            <span className="font-medium text-sm sm:text-base">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Email Input */}
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400">📧</span>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </motion.div>

                            {/* Password Input */}
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400">🔒</span>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div variants={itemVariants}>
                                <motion.button
                                    type="submit"
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span>Login to Continue</span>
                                    <span className="ml-2">→</span>
                                </motion.button>
                            </motion.div>

                            {/* Divider and Register Link */}
                            <motion.div variants={itemVariants} className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">New to EcoTrack?</span>
                                </div>
                            </motion.div>
                            <motion.div variants={itemVariants} className="text-center">
                                <Link
                                    to="/register"
                                    className="inline-block px-4 py-2 text-green-600 font-medium hover:text-green-700 transition duration-200"
                                >
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
