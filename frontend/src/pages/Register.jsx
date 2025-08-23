import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const Register = () => {
    const { registerUser, registerTransporter } = useAuthStore();
    const navigate = useNavigate();
    const [role, setRole] = useState("user");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        street: "",
        city: "",
        state: "",
        pinCode: "",
        vehicleModel: "",
        licensePlate: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (role === "user") {
            await registerUser({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                street: formData.street,
                city: formData.city,
                state: formData.state,
                pinCode: formData.pinCode,
            });
        } else {
            await registerTransporter({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                vehicleModel: formData.vehicleModel,
                licensePlate: formData.licensePlate,
            });
        }

        navigate("/dashboard");
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.1
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

            <motion.div
                className="bg-white shadow-2xl rounded-3xl w-full max-w-4xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="md:flex">
                    {/* Left side - Illustration */}
                    <div className="md:w-2/5 bg-gradient-to-br from-green-400 to-blue-500 p-8 md:p-12 flex flex-col justify-center relative">
                        <div className="absolute inset-0 bg-black/10"></div>

                        <motion.div
                            className="relative z-10 text-white"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <h1 className="text-3xl font-bold mb-4">Join EcoTrack</h1>
                            <p className="text-lg mb-6">Be part of the sustainable waste management revolution</p>

                            <div className="space-y-4 mt-8">
                                {[
                                    { icon: "👤", text: "Track your waste collection" },
                                    { icon: "📊", text: "Monitor recycling impact" },
                                    { icon: "🌍", text: "Contribute to a cleaner planet" },
                                    { icon: "🚚", text: role === "transporter" ? "Optimize your collection routes" : "Get reliable waste pickup" }
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

                        {/* Animated decorative elements */}
                        <motion.div
                            className="absolute top-1/4 right-1/4 bg-white/20 p-3 rounded-full"
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                        >
                            <span className="text-xl">♻</span>
                        </motion.div>
                    </div>

                    {/* Right side - Form */}
                    <div className="md:w-3/5 p-8 md:p-10">
                        <motion.div
                            className="text-center mb-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📝</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
                            <p className="text-gray-600 mt-2">Join our sustainable waste management community</p>
                        </motion.div>

                        {/* Role Toggle */}
                        <motion.div variants={itemVariants} className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                I am registering as a
                            </label>
                            <div className="flex space-x-4">
                                {[
                                    { value: "user", label: "User", icon: "👤", desc: "I need waste collection" },
                                    { value: "transporter", label: "Transporter", icon: "🚚", desc: "I collect waste" }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setRole(option.value)}
                                        className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${role === option.value
                                                ? "border-green-500 bg-green-50 text-green-700"
                                                : "border-gray-200 text-gray-500 hover:border-green-300"
                                            }`}
                                    >
                                        <span className="text-2xl mb-2">{option.icon}</span>
                                        <span className="font-medium">{option.label}</span>
                                        <span className="text-xs mt-1">{option.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        <motion.form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Common fields */}
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400">👤</span>
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </motion.div>

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
                                        name="email"
                                        placeholder="your.email@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </motion.div>

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
                                        name="password"
                                        placeholder="Create a secure password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </motion.div>

                            {/* User-specific fields */}
                            {role === "user" && (
                                <>
                                    <motion.hr variants={itemVariants} className="my-6 border-gray-200" />
                                    <motion.h3 variants={itemVariants} className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <span className="mr-2">🏠</span> Address Information
                                    </motion.h3>

                                    {[
                                        { name: "street", placeholder: "Street Address", icon: "📍" },
                                        { name: "city", placeholder: "City", icon: "🏙️" },
                                        { name: "state", placeholder: "State", icon: "🗺️" },
                                        { name: "pinCode", placeholder: "PIN Code", icon: "📮" }
                                    ].map((field, index) => (
                                        <motion.div key={field.name} variants={itemVariants}>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">{field.icon}</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    name={field.name}
                                                    placeholder={field.placeholder}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </>
                            )}

                            {/* Transporter-specific fields */}
                            {role === "transporter" && (
                                <>
                                    <motion.hr variants={itemVariants} className="my-6 border-gray-200" />
                                    <motion.h3 variants={itemVariants} className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <span className="mr-2">🚚</span> Vehicle Information
                                    </motion.h3>

                                    {[
                                        { name: "vehicleModel", placeholder: "Vehicle Model", icon: "🚗" },
                                        { name: "licensePlate", placeholder: "License Plate Number", icon: "🔢" }
                                    ].map((field, index) => (
                                        <motion.div key={field.name} variants={itemVariants}>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">{field.icon}</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    name={field.name}
                                                    placeholder={field.placeholder}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    required={field.name === "licensePlate"}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </>
                            )}

                            <motion.div variants={itemVariants}>
                                <motion.button
                                    type="submit"
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span>Create Account</span>
                                    <span className="ml-2">→</span>
                                </motion.button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="text-center pt-4">
                                <p className="text-gray-600">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="text-green-600 font-medium hover:text-green-700 transition duration-200"
                                    >
                                        Sign in here
                                    </Link>
                                </p>
                            </motion.div>
                        </motion.form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;