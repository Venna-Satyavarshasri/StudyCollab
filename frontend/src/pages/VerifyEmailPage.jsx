import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const VerifyEmailPage = () => {
    const { token } = useParams();
    const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
    const [message, setMessage] = useState("");
    const hasCalled = useRef(false);

    useEffect(() => {
        if (hasCalled.current) return; // prevent React 18 Strict Mode double-call
        hasCalled.current = true;

        const verify = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/users/verify-email/${token}`
                );
                setMessage(res.data.message);
                setStatus("success");
            } catch (err) {
                setMessage(err.response?.data?.message || "Verification failed. The link may have expired.");
                setStatus("error");
            }
        };
        verify();
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="p-8 bg-gray-800 rounded shadow-md w-full max-w-sm text-center">
                {status === "loading" && (
                    <>
                        <div className="text-4xl mb-4 animate-spin">⏳</div>
                        <p className="text-gray-400">Verifying your email...</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <div className="text-5xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                        <p className="text-gray-400 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            Go to Login
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <>
                        <div className="text-5xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
                        <p className="text-gray-400 mb-6">{message}</p>
                        <Link
                            to="/signup"
                            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            Back to Sign Up
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
