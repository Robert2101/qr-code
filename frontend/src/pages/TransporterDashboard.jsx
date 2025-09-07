import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from "../store/authStore";
import { useTransporterStore } from "../store/transporterStore";
import { motion, AnimatePresence } from 'framer-motion';
import toast from "react-hot-toast";

// --- Icons ---
const ScanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const QrIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4L3 9l9 5 9-5-9-5zM3 9v6l9 5 9-5V9" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

// --- Main Dashboard Component ---
const TransporterDashboard = () => {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
                    <Routes>
                        <Route path="scan" element={<ScanCollection />} />
                        <Route path="my-qr" element={<ShowQrCode />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="*" element={<ScanCollection />} /> {/* Default route */}
                    </Routes>
                </main>
            </div>
        </div>
    );
};

// --- Sidebar ---
const Sidebar = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClasses = "flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200";
    const activeNavLinkClasses = "bg-green-600 text-white";

    return (
        <div className="hidden md:flex w-64 bg-gray-800 text-white flex-col">
            <div className="flex items-center justify-center h-20 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-green-400">Transporter</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink to="/transporter-dashboard/scan" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><ScanIcon /><span className="ml-3">Scan Collection</span></NavLink>
                <NavLink to="/transporter-dashboard/my-qr" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><QrIcon /><span className="ml-3">My QR Code</span></NavLink>
                <NavLink to="/transporter-dashboard/profile" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><ProfileIcon /><span className="ml-3">Profile</span></NavLink>
            </nav>
            <div className="px-4 py-6">
                <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3 text-gray-200 bg-red-600 hover:bg-red-700 rounded-lg">
                    <LogoutIcon /> Logout
                </button>
            </div>
        </div>
    );
};

// --- Header ---
const Header = () => {
    const { currentUser } = useAuthStore();
    return (
        <header className="flex items-center justify-end h-20 px-6 bg-white border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-700">Welcome, {currentUser?.name || 'Transporter'}</span>
        </header>
    );
};

// --- Scan Collection Page ---
const ScanCollection = () => {
    const { scan, loading, error } = useTransporterStore();
    const [userId, setUserId] = useState(null);
    const [weight, setWeight] = useState(0);
    const [wasteTypes, setWasteTypes] = useState({ wet: 0, dry: 0, hazardous: 0 });
    const [coordinates, setCoordinates] = useState([]);
    const [step, setStep] = useState("idle"); // idle → scan → form → done
    const [qrError, setQrError] = useState(null);
    const html5QrCodeScannerRef = useRef(null);

    useEffect(() => {
        const total = (Number(wasteTypes.wet) || 0) + (Number(wasteTypes.dry) || 0) + (Number(wasteTypes.hazardous) || 0);
        setWeight(Math.round(total * 100) / 100);
    }, [wasteTypes]);

    // --- UPDATED SCANNER LOGIC ---
    useEffect(() => {
        const onScanSuccess = (decodedText) => {
            if (html5QrCodeScannerRef.current?.getState() === 2) { // 2 is SCANNING state
                html5QrCodeScannerRef.current.stop().then(() => {
                    setUserId(decodedText);
                    getLocation();
                    setStep("form");
                    setQrError(null);
                }).catch(err => console.error("Failed to stop scanning.", err));
            }
        };

        const startScanner = (cameras) => {
            if (cameras && cameras.length && document.getElementById('qr-reader-container')) {
                const scanner = new window.Html5Qrcode("qr-reader-container");
                html5QrCodeScannerRef.current = scanner;
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                // Start scanning with the back camera (environment)
                scanner.start({ facingMode: "environment" }, config, onScanSuccess, () => { })
                    .catch(() => setQrError("Failed to start scanner. Please try again."));
            } else {
                setQrError("No cameras found on this device.");
            }
        };

        // New function to handle the entire scanning process, including permissions
        const startScanningProcess = async () => {
            try {
                // This will prompt the user for camera permissions
                const cameras = await window.Html5Qrcode.getCameras();
                startScanner(cameras);
            } catch (err) {
                setQrError("Camera permission is required. Please allow access and try again.");
            }
        };

        if (step === 'scan') {
            if (!window.Html5Qrcode) {
                const script = document.createElement("script");
                script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
                script.async = true;
                script.onload = startScanningProcess; // Call the new process handler
                document.body.appendChild(script);
            } else {
                startScanningProcess();
            }
        }

        return () => {
            if (html5QrCodeScannerRef.current?.getState() === 2) {
                html5QrCodeScannerRef.current.stop().catch(err => console.error("Scanner cleanup failed.", err));
            }
        };
    }, [step]);

    const getLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setCoordinates([pos.coords.longitude, pos.coords.latitude]),
            () => setQrError("Could not get location. Please enable it."),
            { enableHighAccuracy: true }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (coordinates.length !== 2) {
            toast.error("Location data is not ready. Please wait.");
            return;
        }
        const res = await scan({ userId, weight, wasteTypes, coordinates });
        if (res) {
            setStep("done");
            setUserId(null);
            setWeight(0);
            setWasteTypes({ wet: 0, dry: 0, hazardous: 0 });
            setCoordinates([]);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
                {step === "idle" && (
                    <motion.div key="idle" exit={{ opacity: 0 }} className="text-center">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Ready for Collection</h2>
                        <button onClick={() => setStep("scan")} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                            Start Scan
                        </button>
                    </motion.div>
                )}
                {step === "scan" && (
                    <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Scan User QR Code</h2>
                        <div className="w-full max-w-xs md:max-w-sm border-4 border-gray-300 rounded-lg overflow-hidden mb-4">
                            <div id="qr-reader-container" />
                        </div>
                        {qrError && <p className="text-red-500 mb-4 font-medium">{qrError}</p>}
                        <button onClick={() => { setStep("idle"); setQrError(null); }} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                            Cancel
                        </button>
                    </motion.div>
                )}
                {step === "form" && (
                    <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Enter Waste Details</h2>
                        <p className="text-sm text-gray-600"><span className="font-medium">Scanned User ID:</span> {userId}</p>
                        <fieldset>
                            <legend className="block mb-2 font-medium text-gray-700">Waste Types (kg)</legend>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600">Wet</label>
                                    <input type="number" step="0.01" value={wasteTypes.wet} onChange={(e) => setWasteTypes({ ...wasteTypes, wet: parseFloat(e.target.value) || 0 })} className="w-full border p-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Dry</label>
                                    <input type="number" step="0.01" value={wasteTypes.dry} onChange={(e) => setWasteTypes({ ...wasteTypes, dry: parseFloat(e.target.value) || 0 })} className="w-full border p-2 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600">Hazardous</label>
                                    <input type="number" step="0.01" value={wasteTypes.hazardous} onChange={(e) => setWasteTypes({ ...wasteTypes, hazardous: parseFloat(e.target.value) || 0 })} className="w-full border p-2 rounded-lg" />
                                </div>
                            </div>
                        </fieldset>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Total Weight (kg)</label>
                            <input type="number" value={weight} readOnly className="w-full border p-2 rounded-lg bg-gray-100" />
                        </div>
                        <button type="submit" disabled={loading.scan || coordinates.length === 0} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
                            {loading.scan ? "Submitting..." : "Submit Collection"}
                        </button>
                    </motion.form>
                )}
                {step === "done" && (
                    <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                        <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h2 className="text-2xl font-bold text-green-600 mt-4">Collection Recorded!</h2>
                        <button onClick={() => setStep("idle")} className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                            Scan Next
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {error && <p className="text-red-500 text-center mt-4 font-medium">{error}</p>}
        </motion.div>
    );
};

// --- Show QR Code Page ---
const ShowQrCode = () => {
    const { qrCodeUrl, getQrCode, loading } = useTransporterStore();
    const { currentUser } = useAuthStore();

    useEffect(() => {
        if (currentUser) {
            getQrCode();
        }
    }, [currentUser, getQrCode]);

    if (!currentUser) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your QR Code</h2>
            <p className="text-gray-600 mb-6">Recyclers will scan this code to verify your identity.</p>
            {loading.qrCode && <p>Loading QR Code...</p>}
            {!loading.qrCode && qrCodeUrl && <img src={qrCodeUrl} alt="Transporter QR Code" className="mx-auto border-4 border-gray-200 rounded-lg" />}
            {!loading.qrCode && !qrCodeUrl && <p className="text-gray-500">Could not load QR code.</p>}
        </motion.div>
    );
};

// --- Profile Page ---
const Profile = () => {
    const { currentUser } = useAuthStore();
    const { updateProfile, loading } = useTransporterStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        model: '',
        licensePlate: '',
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                model: currentUser.vehicleInfo?.model || '',
                licensePlate: currentUser.vehicleInfo?.licensePlate || '',
            });
        }
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateProfile({
            name: formData.name,
            email: formData.email,
            vehicleModel: formData.model,
            licensePlate: formData.licensePlate
        });
        setIsEditing(false);
    };

    if (!currentUser) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-lg mx-auto">
                <p>Loading Profile...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
                <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 disabled:bg-gray-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 disabled:bg-gray-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle Model</label>
                    <input type="text" name="model" value={formData.model} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 disabled:bg-gray-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">License Plate</label>
                    <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 disabled:bg-gray-200" />
                </div>
                {isEditing && (
                    <button type="submit" disabled={loading.profile} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">
                        {loading.profile ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </form>
        </motion.div>
    );
};

export default TransporterDashboard;
