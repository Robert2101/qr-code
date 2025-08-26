import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import useAdminStore from '../store/adminStore.js';

// You'll need to create these components to manage different sections
const DashboardStats = () => <div className="p-6"><h2>Dashboard Overview</h2><p>Statistics will be shown here.</p></div>;
const UserManagement = () => <div className="p-6"><h2>User Management</h2><p>A table of users will be shown here.</p></div>;
const TransporterManagement = () => <div className="p-6"><h2>Transporter Management</h2><p>A table of transporters will be shown here.</p></div>;
const RecyclerManagement = () => <div className="p-6"><h2>Recycler Management</h2><p>A table of recyclers will be shown here.</p></div>;


const AdminDashboard = () => {
    const { admin, logout } = useAdminStore();
    const location = useLocation();

    const navLinks = [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/transporters', label: 'Transporters' },
        { to: '/admin/recyclers', label: 'Recyclers' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="p-6 text-2xl font-bold border-b border-gray-700">
                    Admin Panel
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center px-4 py-2 rounded-md text-lg font-medium transition-colors duration-200 ${location.pathname.startsWith(link.to)
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={logout}
                        className="w-full px-4 py-2 text-lg font-medium text-left text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
                    <h1 className="text-2xl font-semibold text-gray-800">Welcome, {admin?.name || 'Admin'}!</h1>
                    <div>
                        {/* You can add profile icons or other header items here */}
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <Routes>
                        <Route path="dashboard" element={<DashboardStats />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="transporters" element={<TransporterManagement />} />
                        <Route path="recyclers" element={<RecyclerManagement />} />
                        {/* Redirect from /admin/ to /admin/dashboard */}
                        <Route index element={<DashboardStats />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
