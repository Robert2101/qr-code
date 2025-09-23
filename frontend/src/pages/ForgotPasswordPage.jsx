import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('user');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {
        sendPasswordResetOtp, resetPasswordWithOtp,
        sendTransporterPasswordResetOtp, resetTransporterPasswordWithOtp,
    } = useAuthStore();

    const handleMobileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (role === 'user') {
                await sendPasswordResetOtp({ mobile });
            } else if (role === 'transporter') {
                await sendTransporterPasswordResetOtp({ mobile });
            }
            setStep(2);
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
            const data = { mobile, otp, newPassword };
            if (role === 'user') {
                await resetPasswordWithOtp(data);
            } else if (role === 'transporter') {
                await resetTransporterPasswordWithOtp(data);
            }
            toast.success("Password reset successfully!");
            navigate('/login');
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
                {step === 1 && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[{ value: "user", label: "User", icon: "👤" }, { value: "transporter", label: "Transporter", icon: "🚚" }
                            ].map((option) => (
                                <button key={option.value} type="button" onClick={() => setRole(option.value)} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${role === option.value ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"}`}>
                                    <span className="text-2xl mb-1">{option.icon}</span><span className="font-medium text-sm">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 1 ? (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Forgot Password?</h2>
                        <p className="text-center text-gray-500 mb-6">Enter your registered mobile number.</p>
                        <form onSubmit={handleMobileSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                <input type="tel" id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" placeholder="Your 10-digit mobile number" required />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400">
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Reset Your Password</h2>
                        <p className="text-center text-gray-500 mb-6">An OTP was sent to your <span className="font-bold">{role}</span> account at <strong>+91 {mobile}</strong>.</p>
                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP Code</label>
                                <input type="text" id="otp" value={otp} maxLength="6" onChange={(e) => setOtp(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Enter 6-digit code" required />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="Enter your new password" required />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                )}
                <p className="text-center text-sm text-gray-500 mt-6">
                    <button onClick={() => step === 2 ? setStep(1) : navigate('/login')} className="font-medium text-green-600 hover:underline">
                        {step === 2 ? 'Go Back' : 'Back to Login'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;

