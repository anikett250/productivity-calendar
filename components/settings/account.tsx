"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface UserSession {
  name?: string;
  email?: string;
}

const DefaultUserIcon = () => (
  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000" className="w-[70px] h-[70px]">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0" fill="#7e7e7e"></path>
    </g>
  </svg>
);

export default function SettingsAccount() {
  const { data: session } = useSession();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for custom user_session cookie
    const fetchUserSession = async () => {
      try {
        const response = await fetch("/api/get-user-session");
        if (response.ok) {
          const data = await response.json();
          setUserSession(data);
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();
  }, []);

  // Determine which user data to display
  const displayName = session?.user?.name || userSession?.name || "User";
  const displayEmail = session?.user?.email || userSession?.email || "No email";
  const isGoogleLogin = !!session?.user?.image;
  const photoUrl = session?.user?.image;

  const user = {
    plan: "Beginner",
    name: displayName,
    email: displayEmail,
  };

  return (
    <div className="w-full bg-[#f8f8f8] text-[#303030] rounded-2xl p-6 md:p-8 max-w-[80vh] ">
      {/* Header */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Account</h2>
      </motion.div>

      {/* Plan */}
      <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      >

        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm font-medium text-[#303030] ">Plan</p>
            <p className="text-[15px] font-semibold mt-1">{user.plan}</p>
          </div>

          <button className="bg-[#8054e9] hover:bg-[#6f45d2] px-4 py-2 rounded-lg text-sm text-white transition">
            Manage plan
          </button>
        </div>

        {/* <hr className="border-[#2e2e2e] mb-6" /> */}

        {/* Photo */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[#303030]  mb-2">Photo</p>
          {!loading && (
            <>
              {isGoogleLogin && photoUrl ? (
                <Image
                  src={photoUrl}
                  width={70}
                  height={70}
                  alt="Google Profile"
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="w-[70px] h-[70px] rounded-md flex items-center justify-center">
                  <DefaultUserIcon />
                </div>
              )}
            </>
          )}
          {loading && (
            <div className="w-[70px] h-[70px] rounded-md bg-gray-200 animate-pulse"></div>
          )}
        </div>

        {/* Name */}
        <div className="mb-6">
          <p className="text-sm font-medium text-[#303030] ">Name</p>
          <p className="mt-1 text-[15px] font-semibold">{user.name}</p>
        </div>

        {/* Email */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#303030] ">Email</p>
          <p className="mt-1 text-[15px] font-semibold">{user.email}</p>
        </div>

        {/* Manage Account */}
        <button className="flex items-center gap-2 bg-[#8054e9] hover:bg-[#6f45d2] px-4 py-2 rounded-lg text-sm text-white transition mb-2">
          Manage account
          <ExternalLink size={14} />
        </button>

        <p className="text-xs text-gray-400 mt-1 mb-6">
          To keep your account details secure, we&apos;ll take you to the browser to make changes.
        </p>

        {/* Footer Links */}
        <div className="flex gap-2 text-xs text-gray-400 underline underline-offset-1">
          <button className="text-[#8054e9] " >Terms</button>
          <button className="text-[#8054e9] " >Privacy</button>
          <button className="text-[#8054e9] ">Delete account</button>
        </div>
      </motion.div>
    </div>
  );
}
