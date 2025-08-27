import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate, useParams } from 'react-router-dom';
import useAdminStore from '../store/adminStore';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons (using simple SVGs for self-containment) ---
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const TransporterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11h10M16 16l4-4m0 0l-4-4m4 4H9" /></svg>;
const RecyclerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;


// --- Main Dashboard Component ---
export default function AdminDashboard() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar isSidebarOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
                    <Routes>
                        <Route path="dashboard" element={<DashboardHome />} />
                        <Route path="users" element={<ManageUsers />} />
                        <Route path="transporters" element={<ManageTransporters />} />
                        <Route path="transporters/:id" element={<TransporterDetail />} />
                        <Route path="recyclers" element={<ManageRecyclers />} />
                        <Route path="recyclers/:id" element={<RecyclerDetail />} />
                        <Route path="*" element={<DashboardHome />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

// --- Sidebar, Header, DashboardHome, ManageUsers, ManageTransporters (Components are unchanged) ---
const Sidebar = ({ isSidebarOpen }) => {
    const { logout } = useAdminStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClasses = "flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200";
    const activeNavLinkClasses = "bg-green-600 text-white";

    return (
        <AnimatePresence>
            {isSidebarOpen && (
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white flex flex-col z-30 md:relative md:translate-x-0"
                >
                    <div className="flex items-center justify-center h-20 border-b border-gray-700">
                        <h1 className="text-2xl font-bold text-green-400">EcoTrack</h1>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        <NavLink to="/admin/dashboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><DashboardIcon /><span className="ml-3">Dashboard</span></NavLink>
                        <NavLink to="/admin/users" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><UserIcon /><span className="ml-3">Users</span></NavLink>
                        <NavLink to="/admin/transporters" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><TransporterIcon /><span className="ml-3">Transporters</span></NavLink>
                        <NavLink to="/admin/recyclers" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}><RecyclerIcon /><span className="ml-3">Recyclers</span></NavLink>
                    </nav>
                    <div className="px-4 py-6">
                        <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3 text-gray-200 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200">
                            <LogoutIcon />
                            Logout
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
const Header = ({ toggleSidebar }) => {
    const { admin } = useAdminStore();
    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-gray-200">
            <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none md:hidden">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-700">Welcome, {admin?.name || 'Admin'}</span>
            </div>
        </header>
    );
};
const DashboardHome = () => {
    const { admin, stats, getDashboardStats, loading } = useAdminStore();

    useEffect(() => {
        if (admin) {
            getDashboardStats();
        }
    }, [admin, getDashboardStats]);

    const statCards = [
        { title: 'Total Users', value: stats.userCount, icon: <UserIcon /> },
        { title: 'Total Transporters', value: stats.transporterCount, icon: <TransporterIcon /> },
        { title: 'Total Recyclers', value: stats.recyclerCount, icon: <RecyclerIcon /> },
        { title: 'Total Weight Collected (kg)', value: stats.totalWeightCollected, icon: '♻️' },
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
            {loading ? <p>Loading stats...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, index) => (
                        <motion.div key={index}
                            className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                            </div>
                            <div className="text-green-500 text-3xl">{card.icon}</div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
const ManageUsers = () => {
    const { admin, users, getAllUsers, loading, updateUserById } = useAdminStore();
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (admin) {
            getAllUsers();
        }
    }, [admin, getAllUsers]);

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleUpdateUser = async (updatedData) => {
        await updateUserById(selectedUser._id, updatedData);
        setModalOpen(false);
        setSelectedUser(null);
    };

    const formatAddress = (address) => {
        if (!address) return 'N/A';
        return [address.street, address.city, address.state, address.pinCode].filter(Boolean).join(', ');
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Users</h2>
            {loading ? <p>Loading users...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatAddress(user.address)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <UpdateUserModal user={selectedUser} onUpdate={handleUpdateUser} onClose={() => setModalOpen(false)} />}
        </div>
    );
};
const ManageTransporters = () => {
    const { admin, transporters, getAllTransporters, loading, createTransporter, updateTransporterById } = useAdminStore();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedTransporter, setSelectedTransporter] = useState(null);

    useEffect(() => {
        if (admin) {
            getAllTransporters();
        }
    }, [admin, getAllTransporters]);

    const handleEditClick = (transporter) => {
        setSelectedTransporter(transporter);
        setUpdateModalOpen(true);
    };

    const handleCreate = async (data) => {
        await createTransporter(data);
        setCreateModalOpen(false);
    };

    const handleUpdate = async (data) => {
        await updateTransporterById(selectedTransporter._id, data);
        setUpdateModalOpen(false);
        setSelectedTransporter(null);
    };

    const formatVehicleInfo = (vehicleInfo) => {
        if (!vehicleInfo) return 'N/A';
        if (typeof vehicleInfo === 'string') return vehicleInfo;
        return `${vehicleInfo.model || ''} (${vehicleInfo.licensePlate || ''})`;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Manage Transporters</h2>
                <button onClick={() => setCreateModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                    <PlusIcon /> Add Transporter
                </button>
            </div>
            {loading ? <p>Loading transporters...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transporters.map(t => (
                                <tr key={t._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{t.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{t.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatVehicleInfo(t.vehicleInfo)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                                        <button onClick={() => handleEditClick(t)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                                        <NavLink to={`/admin/transporters/${t._id}`} className="text-green-600 hover:text-green-900 ml-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </NavLink>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isCreateModalOpen && <CreateTransporterModal onCreate={handleCreate} onClose={() => setCreateModalOpen(false)} />}
            {isUpdateModalOpen && <UpdateTransporterModal transporter={selectedTransporter} onUpdate={handleUpdate} onClose={() => setUpdateModalOpen(false)} />}
        </div>
    );
};
// TransporterDetail component to display transporter details and waste collection data
const TransporterDetail = () => {
    const { admin, currentTransporter, transporterCollections, transporterStats, loading, getTransporterCollections } = useAdminStore();
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (admin && id) {
            getTransporterCollections(id);
        }
    }, [admin, id, getTransporterCollections]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleBackClick = () => {
        navigate('/admin/transporters');
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-center">Loading transporter data...</p>
            </div>
        );
    }

    if (!currentTransporter) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                    <button onClick={handleBackClick} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                </div>
                <p className="text-center text-red-500">Transporter not found</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            {/* Header with back button */}
            <div className="flex items-center mb-6">
                <button onClick={handleBackClick} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Transporter Details</h2>
            </div>

            {/* Transporter Info Card */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">Transporter Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600">Name: <span className="text-gray-900 font-medium">{currentTransporter.name}</span></p>
                        <p className="text-gray-600">Email: <span className="text-gray-900 font-medium">{currentTransporter.email}</span></p>
                    </div>
                    <div>
                        <p className="text-gray-600">Vehicle: <span className="text-gray-900 font-medium">
                            {currentTransporter.vehicleInfo?.model || 'N/A'} ({currentTransporter.vehicleInfo?.licensePlate || 'N/A'})
                        </span></p>
                        <p className="text-gray-600">Wallet Balance: <span className="text-gray-900 font-medium">
                            ₹{currentTransporter.walletBalance?.toFixed(2) || '0.00'}
                        </span></p>
                    </div>
                </div>
            </div>

            {/* Waste Collection Stats */}
            {transporterStats && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Collection Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600">Total Collections</p>
                            <p className="text-2xl font-bold">{transporterStats.totalCollections}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600">Total Weight Collected</p>
                            <p className="text-2xl font-bold">{transporterStats.totalWeight.toFixed(2)} kg</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-purple-600">Given to Recyclers</p>
                            <p className="text-2xl font-bold">{transporterStats.wasteToRecyclers.toFixed(2)} kg</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="text-sm text-yellow-600">Pending Waste</p>
                            <p className="text-2xl font-bold">{transporterStats.pendingWaste.toFixed(2)} kg</p>
                        </div>
                    </div>

                    {/* Waste by Type */}
                    <div className="mt-6">
                        <h4 className="text-md font-semibold mb-3">Waste by Type</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-green-600">Dry Waste</p>
                                <p className="text-xl font-bold">{transporterStats.wasteByType.dry.toFixed(2)} kg</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-600">Wet Waste</p>
                                <p className="text-xl font-bold">{transporterStats.wasteByType.wet.toFixed(2)} kg</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <p className="text-sm text-red-600">Hazardous Waste</p>
                                <p className="text-xl font-bold">{transporterStats.wasteByType.hazardous.toFixed(2)} kg</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Collection History Table */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Collection History</h3>
                {transporterCollections.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Types</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recycler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transporterCollections.map(collection => (
                                    <tr key={collection._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(collection.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{collection.user?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{collection.weight.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            {collection.wasteTypes && (
                                                <div className="flex flex-col space-y-1">
                                                    {collection.wasteTypes.dry > 0 && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Dry: {collection.wasteTypes.dry.toFixed(2)} kg</span>}
                                                    {collection.wasteTypes.wet > 0 && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Wet: {collection.wasteTypes.wet.toFixed(2)} kg</span>}
                                                    {collection.wasteTypes.hazardous > 0 && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Hazardous: {collection.wasteTypes.hazardous.toFixed(2)} kg</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${collection.recycler ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {collection.recycler ? 'Delivered' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{collection.recycler?.name || 'Not delivered'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No collections found for this transporter.</p>
                )}
            </div>
        </div>
    );
};

const Modal = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            {children}
        </div>
    </div>
);
const UpdateUserModal = ({ user, onUpdate, onClose }) => {
    const [name, setName] = useState(user.name);
    const [address, setAddress] = useState({
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pinCode: user.address?.pinCode || ''
    });

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({ name, address });
    };

    return (
        <Modal onClose={onClose} title="Edit User">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Street</label>
                    <input type="text" name="street" value={address.street} onChange={handleAddressChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" name="city" value={address.city} onChange={handleAddressChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update User</button>
                </div>
            </form>
        </Modal>
    );
};
const CreateTransporterModal = ({ onCreate, onClose }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', model: '', licensePlate: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, email, password, model, licensePlate } = formData;
        onCreate({ name, email, password, vehicleInfo: { model, licensePlate } });
    };

    return (
        <Modal onClose={onClose} title="Create New Transporter">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" placeholder="Name" onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required />
                <input type="text" name="model" placeholder="Vehicle Model" onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" />
                <input type="text" name="licensePlate" placeholder="License Plate" onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required />
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Create Transporter</button>
                </div>
            </form>
        </Modal>
    );
};
const UpdateTransporterModal = ({ transporter, onUpdate, onClose }) => {
    const [name, setName] = useState(transporter.name);
    const [email, setEmail] = useState(transporter.email);
    const [vehicleInfo, setVehicleInfo] = useState({
        model: transporter.vehicleInfo?.model || '',
        licensePlate: transporter.vehicleInfo?.licensePlate || ''
    });

    const handleVehicleChange = (e) => {
        setVehicleInfo({ ...vehicleInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({ name, email, vehicleInfo });
    };

    return (
        <Modal onClose={onClose} title="Edit Transporter">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle Model</label>
                    <input type="text" name="model" value={vehicleInfo.model} onChange={handleVehicleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">License Plate</label>
                    <input type="text" name="licensePlate" value={vehicleInfo.licensePlate} onChange={handleVehicleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                </div>
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Transporter</button>
                </div>
            </form>
        </Modal>
    );
};


// --- Manage Recyclers Page (with corrected formatLocation) ---
const ManageRecyclers = () => {
    const { admin, recyclers, getAllRecyclers, loading, createRecycler, updateRecycler } = useAdminStore();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedRecycler, setSelectedRecycler] = useState(null);

    useEffect(() => {
        if (admin) {
            getAllRecyclers();
        }
    }, [admin, getAllRecyclers]);

    const handleCreate = async (data) => {
        await createRecycler(data);
        setCreateModalOpen(false);
    };

    const handleUpdate = async (data) => {
        await updateRecycler(selectedRecycler._id, data);
        setUpdateModalOpen(false);
    };

    const handleEditClick = (recycler) => {
        setSelectedRecycler(recycler);
        setUpdateModalOpen(true);
    };

    const formatLocation = (location) => {
        if (!location || typeof location !== 'object') return location || 'N/A';
        // Corrected to use zipCode as per your schema
        return [location.address, location.city, location.state, location.zipCode].filter(Boolean).join(', ');
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Manage Recyclers</h2>
                <button onClick={() => setCreateModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
                    <PlusIcon /> Add Recycler
                </button>
            </div>
            {loading ? <p>Loading recyclers...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recyclers.map(r => (
                                <tr key={r._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{r.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{r.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatLocation(r.location)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex">
                                        <button onClick={() => handleEditClick(r)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <NavLink to={`/admin/recyclers/${r._id}`} className="text-blue-600 hover:text-blue-900">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </NavLink>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isCreateModalOpen && <CreateRecyclerModal onCreate={handleCreate} onClose={() => setCreateModalOpen(false)} />}
            {isUpdateModalOpen && <UpdateRecyclerModal recycler={selectedRecycler} onUpdate={handleUpdate} onClose={() => setUpdateModalOpen(false)} />}
        </div>
    );
};


// --- Create Recycler Modal (FIXED) ---
const CreateRecyclerModal = ({ onCreate, onClose }) => {
    // State to hold all form fields, with location as a nested object
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });

    // A single handler for all input fields
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // Destructure the form data
        const { name, email, password, address, city, state, zipCode } = formData;
        // Create the final data object with the nested location object
        const dataToSubmit = {
            name,
            email,
            password,
            location: {
                address,
                city,
                state,
                zipCode
            }
        };
        onCreate(dataToSubmit);
    };

    return (
        <Modal onClose={onClose} title="Create New Recycler">
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required />

                {/* --- LOCATION FIELDS --- */}
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required />
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required />
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required />
                <input type="text" name="zipCode" placeholder="Zip Code" value={formData.zipCode} onChange={handleChange} className="w-full border border-gray-300 rounded-md py-2 px-3" required />

                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Create Recycler</button>
                </div>
            </form>
        </Modal>
    );
};

// RecyclerDetail component to display recycler details and waste collection data
const RecyclerDetail = () => {
    const { admin, currentRecycler, recyclerCollections, recyclerStats, loading, getRecyclerCollections } = useAdminStore();
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (admin && id) {
            getRecyclerCollections(id);
        }
    }, [admin, id, getRecyclerCollections]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleBackClick = () => {
        navigate('/admin/recyclers');
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-center">Loading recycler data...</p>
            </div>
        );
    }

    if (!currentRecycler) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                    <button onClick={handleBackClick} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                </div>
                <p className="text-center text-red-500">Recycler not found</p>
            </div>
        );
    }

    const formatLocation = (location) => {
        if (!location || typeof location !== 'object') return 'N/A';
        return [location.address, location.city, location.state, location.zipCode].filter(Boolean).join(', ');
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            {/* Header with back button */}
            <div className="flex items-center mb-6">
                <button onClick={handleBackClick} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Recycler Details</h2>
            </div>

            {/* Recycler Info Card */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">Recycler Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600">Name: <span className="text-gray-900 font-medium">{currentRecycler.name}</span></p>
                        <p className="text-gray-600">Email: <span className="text-gray-900 font-medium">{currentRecycler.email}</span></p>
                    </div>
                    <div>
                        <p className="text-gray-600">Location: <span className="text-gray-900 font-medium">
                            {formatLocation(currentRecycler.location)}
                        </span></p>
                    </div>
                </div>
            </div>

            {/* Waste Collection Stats */}
            {recyclerStats && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Collection Statistics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600">Total Collections</p>
                            <p className="text-2xl font-bold">{recyclerStats.totalCollections}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-600">Total Weight Collected</p>
                            <p className="text-2xl font-bold">{recyclerStats.totalWeight.toFixed(2)} kg</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-purple-600">Waste Types</p>
                            <div className="flex flex-col space-y-1 mt-2">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Dry: {recyclerStats.wasteByType.dry.toFixed(2)} kg</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Wet: {recyclerStats.wasteByType.wet.toFixed(2)} kg</span>
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Hazardous: {recyclerStats.wasteByType.hazardous.toFixed(2)} kg</span>
                            </div>
                        </div>
                    </div>

                    {/* Waste by Transporter */}
                    {recyclerStats.wasteByTransporter && recyclerStats.wasteByTransporter.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-md font-semibold mb-3">Waste by Transporter</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recyclerStats.wasteByTransporter.map((item, index) => (
                                    <div key={index} className="bg-yellow-50 p-4 rounded-lg">
                                        <p className="text-sm text-yellow-600">{item.name}</p>
                                        <p className="text-md font-bold">{item.vehicleNumber}</p>
                                        <p className="text-xl font-bold">{item.weight.toFixed(2)} kg</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Collection History Table */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Collection History</h3>
                {recyclerCollections.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transporter</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste Types</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {recyclerCollections.map(collection => (
                                    <tr key={collection._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(collection.createdAt)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{collection.user?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{collection.transporter?.name || 'N/A'} ({collection.transporter?.vehicleNumber || 'N/A'})</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{collection.weight.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            {collection.wasteTypes && (
                                                <div className="flex flex-col space-y-1">
                                                    {collection.wasteTypes.dry > 0 && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Dry: {collection.wasteTypes.dry.toFixed(2)} kg</span>}
                                                    {collection.wasteTypes.wet > 0 && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Wet: {collection.wasteTypes.wet.toFixed(2)} kg</span>}
                                                    {collection.wasteTypes.hazardous > 0 && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Hazardous: {collection.wasteTypes.hazardous.toFixed(2)} kg</span>}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No collections found for this recycler.</p>
                )}
            </div>
        </div>
    );
};

// --- Update Recycler Modal ---
const UpdateRecyclerModal = ({ recycler, onUpdate, onClose }) => {
    const [name, setName] = useState(recycler.name || '');
    const [email, setEmail] = useState(recycler.email || '');
    const [address, setAddress] = useState(recycler.location?.address || '');
    const [city, setCity] = useState(recycler.location?.city || '');
    const [state, setState] = useState(recycler.location?.state || '');
    const [zipCode, setZipCode] = useState(recycler.location?.zipCode || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({
            name,
            email,
            location: {
                address,
                city,
                state,
                zipCode
            }
        });
    };

    return (
        <Modal onClose={onClose} title="Update Recycler">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        required
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update Recycler</button>
                </div>
            </form>
        </Modal>
    );
};
