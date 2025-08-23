import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { useTransporterStore } from "../store/transporterStore";

// Mock navigation function for example purposes
const navigate = (path) => console.log(`Navigating to ${path}`);

const TransporterDashboard = () => {
    // Zustand store hooks
    const { logout, currentUser } = useAuthStore();
    const { scan, loading, error } = useTransporterStore();

    // Component state
    const [userId, setUserId] = useState(null);
    const [weight, setWeight] = useState(0);
    const [wasteTypes, setWasteTypes] = useState({ wet: 0, dry: 0, hazardous: 0 });
    const [coordinates, setCoordinates] = useState([]);
    const [step, setStep] = useState("idle"); // idle → scan → form → done
    const [qrError, setQrError] = useState(null);

    // Ref for the QR scanner instance
    const html5QrCodeScannerRef = useRef(null);

    // --- Effects ---

    // Effect to automatically calculate total weight
    useEffect(() => {
        const total = (Number(wasteTypes.wet) || 0) + (Number(wasteTypes.dry) || 0) + (Number(wasteTypes.hazardous) || 0);
        setWeight(Math.round(total * 100) / 100);
    }, [wasteTypes]);

    // Effect to manage the QR scanner lifecycle
    useEffect(() => {
        const scriptId = 'html5-qrcode-script';

        const onScanSuccess = (decodedText, decodedResult) => {
            if (html5QrCodeScannerRef.current && html5QrCodeScannerRef.current.isScanning) {
                html5QrCodeScannerRef.current.stop().then(() => {
                    setUserId(decodedText);
                    getLocation();
                    setStep("form");
                    setQrError(null);
                }).catch(err => console.error("Failed to stop scanning.", err));
            }
        };

        const onScanFailure = (error) => { /* Optional */ };

        const startScanner = () => {
            if (step === 'scan' && window.Html5Qrcode && document.getElementById('qr-reader-container')) {
                const html5QrCode = new window.Html5Qrcode("qr-reader-container");
                html5QrCodeScannerRef.current = html5QrCode;
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
                    .catch(err => setQrError("Could not start QR scanner. Check camera permissions."));
            }
        };

        if (step === 'scan') {
            if (!window.Html5Qrcode) {
                const script = document.createElement("script");
                script.id = scriptId;
                script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
                script.async = true;
                script.onload = startScanner;
                document.body.appendChild(script);
            } else {
                startScanner();
            }
        }

        return () => {
            if (html5QrCodeScannerRef.current && html5QrCodeScannerRef.current.isScanning) {
                html5QrCodeScannerRef.current.stop().catch(err => console.error("Failed to stop scanner.", err));
            }
        };
    }, [step]);


    // --- Handlers ---

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setCoordinates([pos.coords.longitude, pos.coords.latitude]),
                (err) => setQrError("Could not get location. Please enable location services."),
                { enableHighAccuracy: true }
            );
        } else {
            setQrError("Geolocation is not supported by this browser.");
        }
    };

    /**
     * Handles form submission.
     * This now sends a "flat" payload where `coordinates` is a top-level property.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (coordinates.length !== 2) {
            setQrError("Location data is not ready. Please wait or try again.");
            return;
        }

        // **MODIFIED PAYLOAD**
        // The `coordinates` array is now a top-level property.
        // The nested `location` object has been removed.
        const payload = {
            userId,
            weight,
            wasteTypes,
            coordinates: coordinates,
        };

        console.log("📦 Sending flattened payload to backend:", JSON.stringify(payload, null, 2));
        const res = await scan(payload);

        if (res) {
            setStep("done");
            setUserId(null);
            setWeight(0);
            setWasteTypes({ wet: 0, dry: 0, hazardous: 0 });
            setCoordinates([]);
        }
    };

    // --- Render Logic ---
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="container mx-auto p-4 md:p-6 max-w-2xl">
                <header className="flex justify-between items-center mb-6 pb-4 border-b">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">🚛 Transporter Dashboard</h1>
                    <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700">
                        Logout
                    </button>
                </header>

                {currentUser && (
                    <div className="mb-8 bg-white p-4 rounded-lg shadow-md border">
                        <h2 className="text-lg font-semibold text-gray-700">Welcome, {currentUser.name}</h2>
                        <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                )}

                <main className="bg-white p-6 rounded-xl shadow-lg">
                    {step === "idle" && (
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Ready for Collection</h2>
                            <button onClick={() => setStep("scan")} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
                                Start Scan
                            </button>
                        </div>
                    )}

                    {step === "scan" && (
                        <div className="flex flex-col items-center">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Scan User QR Code</h2>
                            <div className="w-full max-w-xs md:max-w-sm border-4 border-gray-300 rounded-lg overflow-hidden mb-4">
                                <div id="qr-reader-container" />
                            </div>
                            {qrError && <p className="text-red-500 mb-4">{qrError}</p>}
                            <button onClick={() => { setStep("idle"); setQrError(null); }} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                                Cancel
                            </button>
                        </div>
                    )}

                    {step === "form" && (
                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <p className="text-sm text-gray-600 pt-2">
                                <span className="font-medium">Coordinates:</span>
                                {coordinates.length ? ` [${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}]` : " Acquiring location..."}
                            </p>

                            <button type="submit" disabled={loading.scan || coordinates.length === 0} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
                                {loading.scan ? "Submitting..." : "Submit Collection"}
                            </button>
                        </form>
                    )}

                    {step === "done" && (
                        <div className="text-center py-8">
                            <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <h2 className="text-2xl font-bold text-green-600 mt-4">Collection Recorded!</h2>
                            <button onClick={() => setStep("idle")} className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                                Scan Next
                            </button>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-center mt-4 font-medium">{error}</p>}
                </main>
            </div>
        </div>
    );
};

export default TransporterDashboard;