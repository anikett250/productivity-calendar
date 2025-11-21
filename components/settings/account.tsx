"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  onClose: () => void;
}

export default function SettingsAccount({ onClose }: Props) {
  const user = {
    plan: "Beginner",
    name: "Aniket Tiwari",
    email: "cyberninjahindustani@gmail.com",
    photo: "/profile.jpg",
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
          <Image
            src={user.photo}
            width={70}
            height={70}
            alt="Profile"
            className="rounded-md object-cover"
          />
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
          To keep your account details secure, we'll take you to the browser to make changes.
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
