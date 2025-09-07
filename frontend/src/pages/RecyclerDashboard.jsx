import React, { useState, useEffect, useRef } from 'react';
import {useAuthStore} from '../store/authStore'; // Corrected to default import
import { useRecyclerStore } from '../store/recyclerStore';
import toast from 'react-hot-toast';

// --- QrScanner Component (Unchanged) ---
const QrScanner = ({ onScanSuccess, onClose }) => {
    const scannerRef = useRef(null);
    const scannerInstance = useRef(null);

    useEffect(() => {
        const scriptId = 'html5-qrcode-script';
        const existingScript = document.getElementById(scriptId);

        const startScanner = () => {
            if (!scannerRef.current || !window.Html5Qrcode || scannerInstance.current) return;

            const scanner = new window.Html5Qrcode(scannerRef.current.id);
            scannerInstance.current = scanner;

            const successCallback = (decodedText) => {
                if (scannerInstance.current?.getState() === 2) { // 2 = SCANNING
                    scannerInstance.current.stop()
                        .then(() => onScanSuccess(decodedText))
                        .catch(err => console.error("Failed to stop scanner after success.", err));
                }
            };

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            window.Html5Qrcode.getCameras()
                .then(cameras => {
                    if (cameras && cameras.length) {
                        scanner.start({ facingMode: "environment" }, config, successCallback)
                            .catch(err => {
                                toast.error("Failed to start scanner. Please check camera permissions.");
                                onClose();
                            });
                    } else {
                        toast.error("No camera found on this device.");
                        onClose();
                    }
                })
                .catch(() => {
                    toast.error("Camera permission is required to scan.");
                    onClose();
                });
        };

        if (!existingScript) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
            script.async = true;
            script.onload = startScanner;
            document.body.appendChild(script);
        } else if (window.Html5Qrcode) {
            startScanner();
        }

        return () => {
            if (scannerInstance.current && scannerInstance.current.getState() === 2) {
                scannerInstance.current.stop().catch(err => {
                    console.error("Error stopping scanner on cleanup:", err);
                });
                scannerInstance.current = null;
            }
        };
    }, [onScanSuccess, onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 p-4">
            <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold text-center mb-4 text-gray-800">Scan QR Code</h3>
                <div id="qr-reader" ref={scannerRef} className="w-full"></div>
            </div>
            <button
                onClick={onClose}
                className="mt-4 bg-white text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-200 transition"
            >
                Cancel
            </button>
        </div>
    );
};


// --- DashboardCard Component (Unchanged) ---
const DashboardCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">{title}</h3>
        <div className="flex-grow">{children}</div>
    </div>
);

// --- UPDATED RecyclerDashboard Component ---
const RecyclerDashboard = () => {
    const { currentUser, logout } = useAuthStore();
    const { scanQRCode, loading, scanResult, error, history = [], fetchHistory } = useRecyclerStore();
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleScanSuccess = async (scannedId) => {
        setIsScannerOpen(false);
        await scanQRCode(scannedId);
        fetchHistory();
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {isScannerOpen && (
                <QrScanner
                    onScanSuccess={handleScanSuccess}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}

            <header className="bg-white shadow-md">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-green-600">EcoChain Recycler</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700 hidden sm:block">Welcome, {currentUser?.name}!</span>
                        <button
                            onClick={logout}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-6 py-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Dashboard</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1: Actions and Info */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <DashboardCard title="Scan Transporter QR Code">
                            <p className="text-gray-600 mb-4">
                                Open the camera to scan a transporter's QR code and claim their collected waste.
                            </p>
                            <button
                                onClick={() => setIsScannerOpen(true)}
                                disabled={loading.scan}
                                className="w-full mt-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6.586 4.414l-1.414-1.414M4 12H2m17.414-6.586l-1.414 1.414M12 20v-1m6.586-13.414l-1.414 1.414M4.586 19.414l1.414-1.414" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18a6 6 0 100-12 6 6 0 000 12z" /></svg>
                                {loading.scan ? 'Processing...' : 'Open Camera Scanner'}
                            </button>
                        </DashboardCard>
                        <DashboardCard title="Your Information">
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Name:</strong> {currentUser?.name}</p>
                                <p><strong>Email:</strong> {currentUser?.email}</p>
                                <p><strong>Location:</strong> {`${currentUser?.location?.city}, ${currentUser?.location?.state}`}</p>
                            </div>
                        </DashboardCard>
                    </div>

                    {/* Column 2: Scan Result and History */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <DashboardCard title="Last Scan Result">
                            {loading.scan && <p className="text-gray-600">Waiting for scan result...</p>}
                            {error && <p className="text-red-500 font-semibold">Error: {error}</p>}
                            {scanResult && !loading.scan && (
                                <div className="space-y-2 text-gray-700">
                                    <p className="font-bold text-green-600">{scanResult.message}</p>
                                    <p><strong>Collections Claimed:</strong> {scanResult.claimedCount}</p>
                                    <p><strong>Total Est. Weight:</strong> {scanResult.estimatedTotalWeight} kg</p>
                                </div>
                            )}
                            {!scanResult && !loading.scan && !error && <p className="text-gray-500">No scan has been performed yet.</p>}
                        </DashboardCard>

                        {/* --- UPDATED HISTORY CARD --- */}
                        <DashboardCard title="Collection History">
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {loading.history && <p>Loading history...</p>}
                                {!loading.history && history.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">You have no collection history yet.</p>
                                )}
                                {!loading.history && history.map((item) => (
                                    <div key={item._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.weight} kg collected</p>
                                                <p className="text-xs text-gray-500">
                                                    From User: <span className="font-medium">{item.user?.name || 'N/A'}</span>
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Via Transporter: <span className="font-medium">{item.transporter?.name || 'N/A'}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-medium text-gray-600">
                                                    {new Date(item.updatedAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <details className="text-xs mt-2 cursor-pointer">
                                            <summary className="font-medium text-gray-500 hover:text-gray-800">Show Details</summary>
                                            <div className="pl-4 mt-2 pt-2 border-t border-gray-200">
                                                <p className="font-semibold mb-1">Waste Breakdown:</p>
                                                <ul className="list-disc list-inside text-gray-600">
                                                    <li>Wet: {item.wasteTypes?.wet || 0} kg</li>
                                                    <li>Dry: {item.wasteTypes?.dry || 0} kg</li>
                                                    <li>Hazardous: {item.wasteTypes?.hazardous || 0} kg</li>
                                                </ul>
                                            </div>
                                        </details>

                                        <div className="text-xs mt-3">
                                            <span className={`px-2 py-1 rounded-full text-white ${item.status === 'Trash Dumped' ? 'bg-yellow-600' : 'bg-blue-500'}`}>
                                                Status: {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DashboardCard>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RecyclerDashboard;
