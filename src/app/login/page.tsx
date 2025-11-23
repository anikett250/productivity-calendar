'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important: include cookies in the request
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Login successful");
        console.log("Login successful, cookies set");
        
        // Wait a moment to ensure cookies are set, then hard redirect
        // This ensures the middleware can read the cookies on the next request
        setTimeout(() => {
          window.location.href = "/calendar";
        }, 1500);
      } else {
        setMessage(data.error || "Login failed");
        console.error("Login failed:", data.error);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <svg viewBox="0 0 24 24" version="1.1" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
          <g>
            <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" fillRule="nonzero"></path>
            <path d="M5,4 C5,2.89543 5.89543,2 7,2 L17,2 C18.1046,2 19,2.89543 19,4 L19,5.85926 C19,7.53103 18.1645,9.09219 16.7735,10.0195 L13.8028,12 L16.7735,13.9805 C18.1645,14.9078 19,16.469 19,18.1407 L19,20 C19,21.1046 18.1046,22 17,22 L7,22 C5.89543,22 5,21.1046 5,20 L5,18.1407 C5,16.469 5.83551,14.9078 7.2265,13.9805 L10.1972,12 L7.2265,10.0195 C5.83551,9.09219 5,7.53103 5,5.85926 L5,4 Z M12,10.7981 L15.6641,8.35542 C16.4987,7.79902 17,6.86232 17,5.85926 L17,4 L7,4 L7,5.85926 C7,6.86232 7.5013,7.79902 8.3359,8.35542 L12,10.7981 Z M12,13.2018 L8.3359,15.6446 C7.5013,16.201 7,17.1377 7,18.1407 L7,20 L17,20 L17,18.1407 C17,17.1377 16.4987,16.201 15.6641,15.6446 L12,13.2018 Z" fill="#8054e9"></path>
          </g>
        </svg>
        <span className="-ml-2 text-xl font-bold text-[#8054e9]">Kairos</span>
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-2xl px-8 py-10">
          <h1 className="text-2xl font-extrabold mb-2">Welcome Back!</h1>
          <p className="text-sm text-gray-500 mb-6">Please enter your log in detals below</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {message && (
              <div className={`text-center p-2 mb-2 rounded ${message.toLowerCase().includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 hover:border-[#8054e9] transition-all rounded-[13px] focus:outline-none focus:ring-2 focus:ring-gray-100"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 hover:border-[#8054e9] transition-all rounded-[13px] focus:outline-none focus:ring-2 focus:ring-gray-100"
              />
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-[#8054e9] ">Forget password?</button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8054e9] text-white py-3 rounded-[13px] font-medium disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log in"}
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
                onClick={() => signIn('google', { callbackUrl: '/calendar' })}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 rounded-[13px] bg-white text-sm hover:bg-gray-50 transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FBBC05" d="M9.83 24c0-1.52.25-2.98.7-4.36L2.62 13.6A23.8 23.8 0 0 0 .21 24c0 3.74.87 7.26 2.41 10.39l7.9-6.05A14.14 14.14 0 0 1 9.83 24Z" />
                  <path fill="#EB4335" d="M23.71 10.13c3.31 0 6.3 1.17 8.65 3.1l6.84-6.83A23.65 23.65 0 0 0 23.71.53c-9.28 0-17.27 5.31-21.09 13.07l7.9 6.04c1.82-5.53 7.02-9.51 13.19-9.51Z" />
                  <path fill="#34A853" d="M23.71 37.87c-6.17 0-11.37-3.98-13.19-9.51l-7.9 6.04A23.68 23.68 0 0 0 23.71 47.47c5.73 0 11.21-2.03 15.31-5.85l-7.51-5.8a14.15 14.15 0 0 1-7.8 2.05Z" />
                  <path fill="#4285F4" d="M46.15 24c0-1.39-.21-2.88-.53-4.27H23.71v9.07h12.61a13.87 13.87 0 0 1-4.8 7.01l7.51 5.8C43.34 37.61 46.15 31.65 46.15 24Z" />
                </svg>
                <span>Log in with Google</span>
              </button>
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              Dont have an account? <Link type="button" href="/signup" className="text-[#8054e9] ">Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
