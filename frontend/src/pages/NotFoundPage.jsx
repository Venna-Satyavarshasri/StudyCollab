import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
    useEffect(() => { document.title = '404 – Page Not Found'; }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center px-4">
            <img src="/logo.svg" alt="Logo" className="w-16 h-16 mb-6 opacity-40" style={{ filter: 'brightness(0) invert(1)' }} />
            <h1 className="text-8xl font-bold text-indigo-500 mb-2">404</h1>
            <h2 className="text-2xl font-semibold mb-3">Page not found</h2>
            <p className="text-gray-400 mb-8 max-w-sm">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/dashboard"
                className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
                Back to Dashboard
            </Link>
        </div>
    );
};

export default NotFoundPage;
