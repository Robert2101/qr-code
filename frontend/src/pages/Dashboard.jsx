import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Dashboard = () => {
    const { currentUser, logout } = useAuthStore();
    const {
        qrCodeUrl,
        walletBalance,
        collections,
        fetchQR,
        fetchWallet,
        fetchCollections,
        updateProfile,
    } = useUserStore();

    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        street: "",
        city: "",
        state: "",
        pinCode: "",
    });

    useEffect(() => {
        if (currentUser) {
            fetchQR();
            fetchWallet();
            fetchCollections();

            // prefill form with existing data
            setProfileData({
                name: currentUser.name || "",
                street: currentUser.address?.street || "",
                city: currentUser.address?.city || "",
                state: currentUser.address?.state || "",
                pinCode: currentUser.address?.pinCode || "",
            });
        }
    }, [currentUser]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleInputChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const res = await updateProfile(profileData);
        if (res?.user) {
            setIsEditing(false);
        }
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
            {/* Navigation Bar */}
            <nav className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md mb-6">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-3">
                            ♻
                        </div>
                        <span className="text-xl font-bold text-gray-800">EcoTrack</span>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-200 flex items-center"
                        >
                            <span className="mr-2">👤</span> Edit Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition duration-200 flex items-center"
                        >
                            <span className="mr-2">🚪</span> Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Welcome Section */}
            <motion.div
                className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl shadow-lg p-8 mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            Welcome back, {currentUser?.name || "Eco Warrior"}! 🌱
                        </h1>
                        <p className="text-lg opacity-90">
                            Thank you for contributing to a cleaner planet with your sustainable waste management.
                        </p>
                    </div>
                    <motion.div
                        className="mt-4 md:mt-0 bg-white/20 p-4 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <span className="text-4xl">♻</span>
                    </motion.div>
                </div>
            </motion.div>

            {/* Dashboard Content */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Wallet Card */}
                <motion.div
                    className="bg-white rounded-2xl shadow-md p-6"
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                            <span className="mr-2">💰</span> Wallet Balance
                        </h2>
                        <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                            ECO Credits
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600">₹{walletBalance}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Earn more by recycling properly</p>
                    </div>
                </motion.div>

                {/* QR Code Card */}
                <motion.div
                    className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center"
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                >
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        <span className="mr-2">🔍</span> Your QR Code
                    </h2>
                    {qrCodeUrl ? (
                        <motion.div
                            className="p-2 bg-white border border-gray-200 rounded-xl shadow-inner"
                            whileHover={{ scale: 1.05 }}
                        >
                            <img
                                src={qrCodeUrl}
                                alt="QR Code"
                                className="w-40 h-40 object-contain"
                            />
                        </motion.div>
                    ) : (
                        <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center">
                            <p className="text-gray-500 text-sm text-center">No QR code available</p>
                        </div>
                    )}
                    <p className="text-sm text-gray-500 mt-4 text-center">
                        Show this QR code to the transporter during waste collection
                    </p>
                </motion.div>
            </motion.div>

            {/* Collections Section */}
            <motion.div
                className="bg-white rounded-2xl shadow-md p-6 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <span className="mr-2">📦</span> Collection History
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {collections.length} Collections
                    </span>
                </div>

                {collections.length > 0 ? (
                    <div className="space-y-4">
                        {collections.map((c, index) => (
                            <motion.div
                                key={c._id}
                                className="p-5 bg-gray-50 rounded-xl border border-gray-100"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -3 }}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
                                    <div>
                                        <span className="text-gray-700 font-medium">
                                            Transporter: {c.transporter?.name || "N/A"}
                                        </span>
                                        <span className="mx-2 text-gray-400">•</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="mt-2 md:mt-0">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : c.status === 'in-progress'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {c.status}
                                        </span>
                                    </div>
                                </div>

                                {c.recycler && (
                                    <div className="text-sm text-gray-600 mb-3">
                                        Recycler:{" "}
                                        <span className="font-medium">
                                            {c.recycler?.name || "Assigned"}
                                        </span>
                                    </div>
                                )}

                                {/* Weight Info */}
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-gray-700 font-semibold mb-2 flex items-center">
                                        <span className="mr-2">⚖️</span> Total Weight: {c.weight} kg
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                        <div className="bg-green-100 px-3 py-2 rounded-lg text-green-800 flex items-center">
                                            <span className="mr-2">💧</span> Wet: {c.wasteTypes?.wet || 0} kg
                                        </div>
                                        <div className="bg-blue-100 px-3 py-2 rounded-lg text-blue-800 flex items-center">
                                            <span className="mr-2">📄</span> Dry: {c.wasteTypes?.dry || 0} kg
                                        </div>
                                        <div className="bg-red-100 px-3 py-2 rounded-lg text-red-800 flex items-center">
                                            <span className="mr-2">⚠️</span> Hazardous: {c.wasteTypes?.hazardous || 0} kg
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        className="text-center py-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No collections yet</h3>
                        <p className="text-gray-500">Your waste collection history will appear here</p>
                    </motion.div>
                )}
            </motion.div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <span className="mr-2">✏️</span> Edit Profile
                            </h2>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            {[
                                { name: "name", placeholder: "Full Name", icon: "👤" },
                                { name: "street", placeholder: "Street Address", icon: "📍" },
                                { name: "city", placeholder: "City", icon: "🏙️" },
                                { name: "state", placeholder: "State", icon: "🗺️" },
                                { name: "pinCode", placeholder: "PIN Code", icon: "📮" }
                            ].map((field) => (
                                <div key={field.name} className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400">{field.icon}</span>
                                    </div>
                                    <input
                                        type="text"
                                        name={field.name}
                                        value={profileData[field.name]}
                                        onChange={handleInputChange}
                                        placeholder={field.placeholder}
                                        className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            ))}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center"
                                >
                                    <span className="mr-2">💾</span> Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Dashboard;