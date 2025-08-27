import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
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
                        <Route path="recyclers" element={<ManageRecyclers />} />
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleEditClick(t)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
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
    const { admin, recyclers, getAllRecyclers, loading, createRecycler } = useAdminStore();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    useEffect(() => {
        if (admin) {
            getAllRecyclers();
        }
    }, [admin, getAllRecyclers]);

    const handleCreate = async (data) => {
        await createRecycler(data);
        setCreateModalOpen(false);
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recyclers.map(r => (
                                <tr key={r._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{r.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{r.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatLocation(r.location)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isCreateModalOpen && <CreateRecyclerModal onCreate={handleCreate} onClose={() => setCreateModalOpen(false)} />}
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
