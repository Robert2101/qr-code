import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1 for mobile input, 2 for OTP and password reset
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { sendPasswordResetOtp, resetPasswordWithOtp } = useAuthStore();

    const handleMobileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sendPasswordResetOtp({ mobile });
            setStep(2); // Move to the next step on success
        } catch (error) {
            console.error("Failed to send OTP", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters long.");
        }
        setLoading(true);
        try {
            await resetPasswordWithOtp({ mobile, otp, newPassword });
            navigate('/login'); // Redirect to login page after successful reset
        } catch (error) {
            console.error("Failed to reset password", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <motion.div
                className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {step === 1 ? (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Forgot Password?</h2>
                        <p className="text-center text-gray-500 mb-6">Enter your mobile number to receive a reset code.</p>
                        <form onSubmit={handleMobileSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                <input
                                    type="tel" id="mobile" value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    placeholder="Your 10-digit mobile number" required
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Reset Your Password</h2>
                        <p className="text-center text-gray-500 mb-6">An OTP was sent to <strong>+91 {mobile}</strong>.</p>
                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP Code</label>
                                <input
                                    type="text" id="otp" value={otp} maxLength="6"
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    placeholder="Enter 6-digit code" required
                                />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password" id="newPassword" value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    placeholder="Enter your new password" required
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                )}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Remember your password? <Link to="/login" className="font-medium text-green-600 hover:underline">Log in</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;