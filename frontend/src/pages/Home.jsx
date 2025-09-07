import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
    const [activeSection, setActiveSection] = useState("home");

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll("section");
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 100) {
                    setActiveSection(section.getAttribute("id"));
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            window.scrollTo({
                top: section.offsetTop,
                behavior: "smooth"
            });
        }
    };

    // Animation variants
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
        <div className="min-h-screen bg-white">
            {/* Navigation Bar */}
            <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-3">
                            ♻
                        </div>
                        <span className="text-xl font-bold text-gray-800">EcoTrack</span>
                    </motion.div>

                    <div className="hidden md:flex space-x-8">
                        {['home', 'features', 'workflow', 'contact'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollToSection(item)}
                                className={`font-medium capitalize ${activeSection === item ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="flex space-x-4">
                        <Link
                            to="/login"
                            className="px-4 py-2 text-gray-600 font-medium hover:text-green-600 transition duration-200"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-200"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="min-h-screen flex items-center pt-20 pb-10 bg-gradient-to-br from-green-50 to-blue-50">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
                    <motion.div
                        className="md:w-1/2 mb-10 md:mb-0"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                            Smart Waste <span className="text-green-600">Management</span> System
                        </h1>
                        <p className="text-lg text-gray-600 my-6">
                            Digitizing waste collection with QR code validation and real-time tracking for a cleaner, more sustainable future.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    to="/register"
                                    className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition duration-200"
                                >
                                    Get Started
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <button
                                    onClick={() => scrollToSection('features')}
                                    className="inline-block px-8 py-3 bg-white text-green-600 border border-green-600 font-semibold rounded-lg shadow-sm hover:bg-green-50 transition duration-200"
                                >
                                    Learn More
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="md:w-1/2 flex justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <div className="relative">
                            <div className="absolute -inset-6 bg-green-100 rounded-2xl rotate-3"></div>
                            <div className="relative bg-white p-6 rounded-2xl shadow-xl">
                                <div className="w-full h-64 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-lg">
                                    Waste Management Visualization
                                </div>
                                <motion.div
                                    className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                >
                                    <span className="text-xl">♻</span>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="min-h-screen py-20 bg-white flex items-center">
                <div className="container mx-auto px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">How Our System Works</h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Our smart waste management system connects all stakeholders through innovative technology</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: "👤", title: "Users", desc: "Generate unique QR codes for waste bins and track collection history" },
                            { icon: "🚚", title: "Transporters", desc: "Scan QR codes, track routes, and ensure efficient collection" },
                            { icon: "♻", title: "Recyclers", desc: "Process waste materials and track recycling metrics" },
                            { icon: "👨‍💼", title: "Admins", desc: "Monitor system performance and generate detailed reports" }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="mt-20 bg-green-50 rounded-2xl p-8 md:p-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="md:w-1/2 mb-8 md:mb-0">
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Real-time Tracking & Analytics</h3>
                                <p className="text-gray-600 mb-6">Monitor waste collection routes in real-time, analyze efficiency metrics, and optimize operations with our advanced dashboard.</p>
                                <ul className="space-y-2">
                                    {[
                                        "Live route visualization on interactive maps",
                                        "Performance metrics for transporters",
                                        "Waste collection and recycling statistics",
                                        "Customizable reports for decision making"
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <span className="text-green-500 mr-2">✓</span>
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="md:w-1/2 flex justify-center">
                                <motion.div
                                    className="bg-white p-4 rounded-xl shadow-lg"
                                    whileHover={{ rotate: 2 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="bg-gradient-to-r from-blue-400 to-green-400 h-48 w-full rounded-lg flex items-center justify-center text-white font-semibold">
                                        Analytics Dashboard
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Workflow Section */}
            <section id="workflow" className="min-h-screen py-20 bg-gradient-to-br from-blue-50 to-green-50 flex items-center">
                <div className="container mx-auto px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">System Workflow</h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Our seamless process from waste generation to recycling</p>
                    </motion.div>

                    <div className="relative">
                        {/* Timeline */}
                        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-green-200"></div>

                        <div className="space-y-12 md:space-y-0">
                            {[
                                { step: "1", title: "QR Code Generation", desc: "Each user receives a unique QR code for their waste bin", icon: "🔖" },
                                { step: "2", title: "Waste Collection", desc: "Transporter scans QR code during pickup, recording location", icon: "📱" },
                                { step: "3", title: "Route Tracking", desc: "System tracks and maps the transporter's collection route", icon: "🗺️" },
                                { step: "4", title: "Recycling Process", desc: "Waste is delivered to recyclers who record type and quantity", icon: "♻" },
                                { step: "5", title: "Reporting & Analytics", desc: "Admins monitor system performance and generate reports", icon: "📊" }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.7, delay: index * 0.1 }}
                                >
                                    <div className="md:w-1/2 mb-4 md:mb-0 md:p-8">
                                        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                            <span className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-2">{item.step}</span>
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 mt-2">{item.desc}</p>
                                    </div>
                                    <div className="md:w-1/2 flex justify-center">
                                        <motion.div
                                            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            {item.icon}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="py-20 bg-gray-800 text-white">
                <div className="container mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Waste Management?</h2>
                        <p className="text-gray-300 max-w-2xl mx-auto mb-10">Join our ecosystem of users, transporters, recyclers, and administrators working together for a cleaner planet.</p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    to="/register"
                                    className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition duration-200"
                                >
                                    Get Started Now
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <button className="inline-block px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-600 transition duration-200">
                                    Contact Sales
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-6 md:mb-0">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-3">
                                    ♻
                                </div>
                                <span className="text-xl font-bold text-white">EcoTrack</span>
                            </div>
                            <p className="mt-2">Smart Waste Management System</p>
                        </div>

                        <div className="flex space-x-6">
                            {['About', 'Features', 'Pricing', 'Contact'].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => scrollToSection(item.toLowerCase())}
                                    className="hover:text-green-400 transition duration-200"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p>© {new Date().getFullYear()} EcoTrack. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;