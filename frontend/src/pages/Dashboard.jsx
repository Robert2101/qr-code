import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { currentUser, logout, updateCurrentUser } = useAuthStore();
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

            setProfileData({
                name: currentUser.name || "",
                street: currentUser.address?.street || "",
                city: currentUser.address?.city || "",
                state: currentUser.address?.state || "",
                pinCode: currentUser.address?.pinCode || "",
            });
        }
    }, [currentUser]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleInputChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const res = await updateProfile(profileData);
        if (res?.user) {
            updateCurrentUser(res.user);
            setIsEditing(false);
        }
    };

    // Reusable Button Styles
    const btnPrimary = "py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-colors";
    const btnSecondary = "py-2 px-4 bg-slate-200 text-slate-800 font-semibold rounded-lg shadow-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transition-colors";

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* --- Navigation Bar --- */}
                <nav className="bg-white rounded-xl shadow-md p-4 mb-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-green-600">EcoTrack</h1>
                    <div className="flex items-center gap-4">
                        <button className={btnSecondary} onClick={() => setIsEditing(true)}>Edit Profile</button>
                        <button className={btnPrimary} onClick={handleLogout}>Logout</button>
                    </div>
                </nav>

                {/* --- Header --- */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-800">
                        Welcome back, <span className="text-green-600">{currentUser?.name || "Eco Warrior"}!</span> 🌱
                    </h1>
                </header>

                {/* --- Main Content Grid --- */}
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <section className="bg-white p-6 rounded-xl shadow-md lg:col-span-1">
                        <h2 className="text-xl font-bold text-slate-700 border-b pb-2 mb-4">Wallet Balance</h2>
                        <p className="text-5xl font-bold text-green-600">₹{walletBalance}</p>
                    </section>

                    <section className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center lg:col-span-1">
                        <h2 className="text-xl font-bold text-slate-700 border-b pb-2 mb-4 w-full text-center">Your QR Code</h2>
                        {qrCodeUrl ? (
                            <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40 rounded-lg border-4 border-slate-200" />
                        ) : (
                            <p className="text-slate-500">No QR code available</p>
                        )}
                    </section>
                </main>

                {/* --- Collection History --- */}
                <section className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-slate-700 border-b pb-3 mb-4">
                        Collection History ({collections.length} Collections)
                    </h2>
                    <div className="space-y-4">
                        {collections.length > 0 ? (
                            collections.map((c) => (
                                <div key={c._id} className="p-4 border border-slate-200 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 items-center hover:bg-slate-50 transition-colors">
                                    <div><span className="font-semibold text-slate-500 block">Transporter:</span> {c.transporter?.name || "N/A"}</div>
                                    <div><span className="font-semibold text-slate-500 block">Date:</span> {new Date(c.createdAt).toLocaleDateString()}</div>
                                    <div><span className="font-semibold text-slate-500 block">Status:</span> {c.status}</div>
                                    <div><span className="font-semibold text-slate-500 block">Weight:</span> {c.weight} kg</div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 py-4">No collections yet.</p>
                        )}
                    </div>
                </section>

                {/* --- Edit Profile Modal --- */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Edit Profile</h2>
                            <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
                                <input name="name" value={profileData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                                <input name="street" value={profileData.street} onChange={handleInputChange} placeholder="Street" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                                <input name="city" value={profileData.city} onChange={handleInputChange} placeholder="City" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                                <input name="state" value={profileData.state} onChange={handleInputChange} placeholder="State" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
                                <input name="pinCode" value={profileData.pinCode} onChange={handleInputChange} placeholder="Pin Code" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />

                                <div className="flex justify-end gap-4 mt-4">
                                    <button type="button" className={btnSecondary} onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button type="submit" className={btnPrimary}>Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;