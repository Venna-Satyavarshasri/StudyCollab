import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => { document.title = 'Login – Study Planner'; }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await login({ email, password });
            navigate("/dashboard");
            window.location.reload();
        } catch (authError) {
            setError(authError.response?.data?.message || authError.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded shadow-md w-full max-w-sm">
                <div className="flex justify-center mb-4">
                    <img src="/logo.svg" alt="Study Planner Logo" className="w-14 h-14" style={{filter: 'brightness(0) invert(1)'}} />
                </div>
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-400">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-400">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded"
                        required
                    />
                </div>
                <button type="submit" disabled={isLoading} className="w-full px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed">
                    {isLoading ? "Logging in..." : "Login"}
                </button>
                <p className="mt-4 text-center text-gray-400">
                        Don't have an account? <a href="/signup" className="text-indigo-400 hover:underline">Sign up</a>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
