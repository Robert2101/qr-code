import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center p-8 bg-white shadow-lg rounded-2xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Welcome to Our App 🚀
                </h1>
                <div className="flex gap-4 justify-center">
                    <Link
                        to="/login"
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition duration-200"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
