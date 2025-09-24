import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRecyclerStore } from '../store/recyclerStore';
import toast from 'react-hot-toast';

// --- QrScanner Component (self-contained for simplicity) ---
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


// --- DashboardCard Component ---
const DashboardCard = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md h-full flex flex-col ${className}`}>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">{title}</h3>
        <div className="flex-grow flex flex-col">{children}</div>
    </div>
);

// --- Generate Revenue Modal Component ---
const GenerateRevenueModal = ({ summary, onClose, onSubmit, loading }) => {
    const [prices, setPrices] = useState({ wet: '', dry: '', hazardous: '' });

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setPrices(prev => ({ ...prev, [name]: value }));
    };

    const calculateTotal = () => {
        const wetValue = (summary?.wet || 0) * (parseFloat(prices.wet) || 0);
        const dryValue = (summary?.dry || 0) * (parseFloat(prices.dry) || 0);
        const hazardousValue = (summary?.hazardous || 0) * (parseFloat(prices.hazardous) || 0);
        return wetValue + dryValue + hazardousValue;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!prices.wet || !prices.dry || !prices.hazardous) {
            return toast.error("Please enter a price for all waste types.");
        }
        onSubmit({
            wastePrices: {
                wet: parseFloat(prices.wet),
                dry: parseFloat(prices.dry),
                hazardous: parseFloat(prices.hazardous),
            },
            collectionIds: summary.collectionIds
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Generate Revenue Request</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Summary of Pending Waste</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Total Weight:</strong> {summary?.totalWeight.toFixed(2)} kg</p>
                        <p><strong>Collections:</strong> {summary?.collectionIds.length}</p>
                        <p><strong>Wet Waste:</strong> {summary?.wet.toFixed(2)} kg</p>
                        <p><strong>Dry Waste:</strong> {summary?.dry.toFixed(2)} kg</p>
                        <p><strong>Hazardous:</strong> {summary?.hazardous.toFixed(2)} kg</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Enter Price per KG (₹)</label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <input type="number" name="wet" value={prices.wet} onChange={handlePriceChange} placeholder="Wet" className="w-full border p-2 rounded-md" required min="0" step="0.01" />
                            <input type="number" name="dry" value={prices.dry} onChange={handlePriceChange} placeholder="Dry" className="w-full border p-2 rounded-md" required min="0" step="0.01" />
                            <input type="number" name="hazardous" value={prices.hazardous} onChange={handlePriceChange} placeholder="Hazardous" className="w-full border p-2 rounded-md" required min="0" step="0.01" />
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-bold text-gray-800 text-right">
                            Total Est. Revenue: <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
                        </h3>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- RecyclerDashboard Component ---
const RecyclerDashboard = () => {
    const { currentUser, logout } = useAuthStore();
    const {
        scanQRCode, loading, scanResult, error,
        history = [], fetchHistory,
        pendingSummary, fetchPendingCollections, submitRevenueRequest
    } = useRecyclerStore();

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);

    useEffect(() => {
        fetchHistory();
        fetchPendingCollections();
    }, [fetchHistory, fetchPendingCollections]);

    const handleScanSuccess = async (scannedId) => {
        setIsScannerOpen(false);
        await scanQRCode(scannedId);
        fetchHistory();
        fetchPendingCollections(); // Refresh pending summary after scan
    };

    const handleRevenueSubmit = async (data) => {
        try {
            await submitRevenueRequest(data);
            setIsRevenueModalOpen(false); // Close modal on success
        } catch (error) {
            // Error is already toasted in the store, just log it
            console.error("Failed to submit revenue request from component");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {isScannerOpen && <QrScanner onScanSuccess={handleScanSuccess} onClose={() => setIsScannerOpen(false)} />}
            {isRevenueModalOpen && (
                <GenerateRevenueModal
                    summary={pendingSummary}
                    onClose={() => setIsRevenueModalOpen(false)}
                    onSubmit={handleRevenueSubmit}
                    loading={loading.submit}
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
                        <DashboardCard title="Actions">
                            <div className="flex flex-col space-y-4 h-full">
                                <p className="text-gray-600">Claim waste from transporters or generate revenue from pending collections.</p>
                                <button
                                    onClick={() => setIsScannerOpen(true)}
                                    disabled={loading.scan}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 flex items-center justify-center"
                                >
                                    Scan Transporter QR
                                </button>
                                <button
                                    onClick={() => setIsRevenueModalOpen(true)}
                                    disabled={!pendingSummary || pendingSummary.totalWeight === 0 || loading.pending}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 flex items-center justify-center"
                                >
                                    Generate Revenue
                                </button>
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Pending Revenue Summary">
                            {loading.pending && <p>Loading summary...</p>}
                            {pendingSummary && (
                                <div className="space-y-2 text-gray-700">
                                    <p><strong>Total Weight:</strong> <span className="font-bold text-lg">{pendingSummary.totalWeight.toFixed(2)} kg</span></p>
                                    <hr className="my-2" />
                                    <p><strong>Wet:</strong> {pendingSummary.wet.toFixed(2)} kg</p>
                                    <p><strong>Dry:</strong> {pendingSummary.dry.toFixed(2)} kg</p>
                                    <p><strong>Hazardous:</strong> {pendingSummary.hazardous.toFixed(2)} kg</p>
                                    <p><strong>Collections:</strong> {pendingSummary.collectionIds.length}</p>
                                </div>
                            )}
                        </DashboardCard>
                    </div>

                    {/* Column 2: History */}
                    <div className="lg:col-span-2">
                        <DashboardCard title="Collection History" className="h-[calc(100vh-200px)]">
                            <div className="space-y-3 h-full overflow-y-auto pr-2">
                                {loading.history && <p>Loading history...</p>}
                                {!loading.history && history.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">You have no collection history yet.</p>
                                )}
                                {!loading.history && history.map((item) => (
                                    <div key={item._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.weight} kg collected</p>
                                                <p className="text-xs text-gray-500">From User: <span className="font-medium">{item.user?.name || 'N/A'}</span></p>
                                                <p className="text-xs text-gray-500">Via Transporter: <span className="font-medium">{item.transporter?.name || 'N/A'}</span></p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-medium text-gray-600">{new Date(item.updatedAt).toLocaleString()}</span>
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
                                            <span className={`px-2 py-1 rounded-full text-white font-semibold text-xs ${item.status === 'Completed' ? 'bg-green-500' :
                                                    item.status === 'Trash Dumped' ? 'bg-yellow-500' : 'bg-blue-500'
                                                }`}>
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

