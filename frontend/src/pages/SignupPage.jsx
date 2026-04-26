import React, {useState, useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {useAuth} from "../context/AuthContext.jsx"
import axios from "axios"

const SignupPage = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [emailSent, setEmailSent] = useState(false)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [resendMessage, setResendMessage] = useState("")
    const navigate = useNavigate()
    const {signup} = useAuth()

    useEffect(() => { document.title = 'Sign Up – Study Planner'; }, []);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSubmitLoading(true)
        try {
            await signup({name, email, password})
            setEmailSent(true)
        } catch (err) {
            setError(err.response?.data?.message || err.message)
        } finally {
            setSubmitLoading(false)
        }
    }

    const handleResend = async () => {
        setResendLoading(true)
        setResendMessage("")
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/users/resend-verification`,
                { email }
            )
            setResendMessage(res.data.message)
        } catch (err) {
            setResendMessage(err.response?.data?.message || "Failed to resend. Try again.")
        } finally {
            setResendLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="p-8 bg-gray-800 rounded shadow-md w-full max-w-sm text-center">
                    <div className="text-5xl mb-4">📧</div>
                    <h2 className="text-2xl font-bold mb-2 text-white">Check your inbox</h2>
                    <p className="text-gray-400 mb-6">
                        We sent a verification link to <span className="text-indigo-400 font-medium">{email}</span>.
                        Click it to activate your account.
                    </p>
                    {resendMessage && (
                        <p className="text-sm mb-4 text-green-400">{resendMessage}</p>
                    )}
                    <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="text-sm text-indigo-400 hover:underline disabled:opacity-50"
                    >
                        {resendLoading ? "Sending..." : "Didn't get it? Resend email"}
                    </button>
                    <p className="mt-6 text-gray-500 text-sm">
                        Already verified?{" "}
                        <a href="/login" className="text-indigo-400 hover:underline">Log in</a>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded shadow-md w-full max-w-sm">
                <div className="flex justify-center mb-4">
                    <img src="/logo.svg" alt="Study Planner Logo" className="w-14 h-14" style={{filter: 'brightness(0) invert(1)'}} />
                </div>
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign Up</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-400">Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded"
                        required
                    />
                </div>
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
                    {password.length > 0 && (() => {
                        const checks = [
                            password.length >= 8,
                            /[A-Z]/.test(password),
                            /[0-9]/.test(password),
                            /[^A-Za-z0-9]/.test(password),
                        ];
                        const score = checks.filter(Boolean).length;
                        const labels = ['Weak', 'Fair', 'Good', 'Strong'];
                        const colors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
                        const textColors = ['text-red-400', 'text-yellow-400', 'text-blue-400', 'text-green-400'];
                        return (
                            <div className="mt-2">
                                <div className="flex space-x-1 mb-1">
                                    {[0,1,2,3].map(i => (
                                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-gray-600'}`} />
                                    ))}
                                </div>
                                <p className={`text-xs ${textColors[score - 1]}`}>{labels[score - 1]}</p>
                            </div>
                        );
                    })()}
                </div>
                <button type="submit" disabled={submitLoading} className="w-full px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitLoading ? "Sending verification email..." : "Sign Up"}
                </button>
                <p className="mt-4 text-center text-gray-400">
                    Already have an account? <a href="/login" className="text-indigo-400 hover:underline">Login</a>
                </p>
            </form>
        </div>
    )
}

export default SignupPage;