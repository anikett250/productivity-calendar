'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const fullName = `${firstname} ${lastname}`.trim();

            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: fullName,
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("✓ Account created successfully! Redirecting to login...");
                // Clear form
                setFirstname('');
                setLastname('');
                setEmail('');
                setPassword('');
                // Redirect to login after 1.5 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 1500);
            } else {
                setMessage(data.message || "Signup failed. Please try again.");
            }
        } catch {
            setMessage("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-md rounded-2xl px-8 py-10">
                    <h1 className="text-2xl font-extrabold mb-2">Welcome!</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Please enter your signup details below
                    </p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {message && (
                            <div className={`text-center p-2 mb-2 rounded ${message.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message}
                            </div>
                        )}
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-200 hover:border-[#8054e9] transition-all rounded-[13px] focus:outline-none focus:ring-2 focus:ring-gray-100 disabled:opacity-50"
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-200 hover:border-[#8054e9] transition-all rounded-[13px] focus:outline-none focus:ring-2 focus:ring-gray-100 disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-200 hover:border-[#8054e9] transition-all rounded-[13px] focus:outline-none focus:ring-2 focus:ring-gray-100 disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-200 hover:border-[#8054e9] transition-all rounded-[13px] focus:outline-none focus:ring-2 focus:ring-gray-100 disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#8054e9] text-white py-3 rounded-[13px] font-medium disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>

                        <div className="flex items-center my-2">
                            <div className="flex-1 h-px bg-gray-200" />
                            <div className="px-3 text-sm text-gray-400">or continue</div>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => window.location.href = '/api/auth/signin/google'}
                                className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-[13px] bg-white text-sm hover:bg-gray-50"
                            >
                                <svg width="18" height="18" viewBox="0 0 48 48">
                                    <path fill="#FBBC05" d="M9.83 24c0-1.52.25-2.98.7-4.36L2.62 13.6A23.8 23.8 0 0 0 .21 24c0 3.74.87 7.26 2.41 10.39l7.9-6.05A14.14 14.14 0 0 1 9.83 24Z" />
                                    <path fill="#EB4335" d="M23.71 10.13c3.31 0 6.3 1.17 8.65 3.1l6.84-6.83A23.65 23.65 0 0 0 23.71.53c-9.28 0-17.27 5.31-21.09 13.07l7.9 6.04c1.82-5.53 7.02-9.51 13.19-9.51Z" />
                                    <path fill="#34A853" d="M23.71 37.87c-6.17 0-11.37-3.98-13.19-9.51l-7.9 6.04A23.68 23.68 0 0 0 23.71 47.47c5.73 0 11.21-2.03 15.31-5.85l-7.51-5.8a14.15 14.15 0 0 1-7.8 2.05Z" />
                                    <path fill="#4285F4" d="M46.15 24c0-1.39-.21-2.88-.53-4.27H23.71v9.07h12.61a13.87 13.87 0 0 1-4.8 7.01l7.51 5.8C43.34 37.61 46.15 31.65 46.15 24Z" />
                                </svg>
                                <span>Sign up with Google</span>
                            </button>
                        </div>

                        <div className="text-center text-sm text-gray-500 mt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[#8054e9]">
                                Log in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
