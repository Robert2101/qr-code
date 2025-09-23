import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const OtpPage = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtpAndLogin } = useAuthStore();

    // Safely get the mobile number passed from the registration page's state
    const mobile = location.state?.mobile;

    // If a user lands on this page directly without a mobile number,
    // redirect them back to the registration page.
    useEffect(() => {
        if (!mobile) {
            toast.error("Something went wrong. Please register again.");
            navigate('/register');
        }
    }, [mobile, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            return toast.error("Please enter a valid 6-digit OTP.");
        }
        setLoading(true);
        try {
            await verifyOtpAndLogin({ mobile, otp });
            // The checkAuth in App.jsx will handle redirecting to the correct dashboard,
            // so we can navigate to a generic '/dashboard' to trigger the check.
            navigate('/dashboard');
        } catch (error) {
            console.error("OTP verification failed:", error);
            // The error toast is already handled in the Zustand store
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <motion.div
                className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8 md:p-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📱</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Verify Your Account</h2>
                    <p className="text-gray-600 mt-2">
                        Enter the 6-digit code sent to your mobile number: <strong>+91 {mobile}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="otp" className="sr-only">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            // Allow only numbers to be entered
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength="6"
                            className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="_ _ _ _ _ _"
                            disabled={loading}
                            required
                        />
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center disabled:bg-gray-400"
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </motion.button>
                </form>

                <div className="text-center pt-6">
                    <p className="text-sm text-gray-500">
                        Didn't receive the code?{' '}
                        <Link to="/register" className="font-medium text-green-600 hover:underline">
                            Try registering again.
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default OtpPage;
