"use client";

import { Calendar } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function General() {
    const [showExperimental, setShowExperimental] = useState(false);

    // Individual toggle states
    const [newSidebar, setNewSidebar] = useState(false);
    const [betaAnimations, setBetaAnimations] = useState(false);
    const [commandMenu, setCommandMenu] = useState(false);

    return (
        <div className="w-full h-full bg-[#f8f8f8] text-black p-8 overflow-y-auto relative">
            {/* General Section */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold mb-6">General</h2>

                {/* Language */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-[#303030] mb-2">
                        Language
                    </label>
                    <select className="w-full bg-[#f8f8f8] transition-all hover:border-[#8054e9] border border-[#f8f8f8] rounded-[13px] px-3 py-2 text-sm focus:outline-none">
                        <option>English</option>
                        <option>Hindi</option>
                        <option>French</option>
                        <option>Spanish</option>
                    </select>
                </div>

                {/* Home View */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-[#303030] mb-2">
                        Home view
                    </label>
                    <div className="relative pl-10">
                        <select className="w-full appearance-none bg-[#f8f8f8] transition-all hover:border-[#8054e9] border border-[#f8f8f8] rounded-[13px] px-3 py-2 text-sm focus:outline-none">
                            <option>Today</option>
                            <option>Upcoming</option>
                            <option>Week</option>
                            <option>Month</option>
                        </select>
                        <Calendar
                            size={16}
                            className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"
                        />
                    </div>
                </div>
            </section>

            {/* Date & Time Section */}
            <section>
                <h2 className="text-lg font-semibold mb-6">Date & time</h2>

                {/* Time Zone */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-[#303030] mb-2">
                        Time zone
                    </label>
                    <select className="w-full bg-[#f8f8f8] transition-all hover:border-[#8054e9] border border-[#f8f8f8] rounded-[13px] px-3 py-2 text-sm focus:outline-none">
                        <option>Asia/Kolkata</option>
                        <option>America/New_York</option>
                        <option>Europe/London</option>
                        <option>Asia/Tokyo</option>
                    </select>
                </div>

                {/* Time Format */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-[#303030] mb-2">
                        Time format
                    </label>
                    <select className="w-full bg-[#f8f8f8] transition-all hover:border-[#8054e9] border border-[#f8f8f8] rounded-[13px] px-3 py-2 text-sm focus:outline-none">
                        <option>1:00pm</option>
                        <option>13:00</option>
                    </select>
                </div>

                {/* Date Format */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-[#303030] mb-2">
                        Date format
                    </label>
                    <select className="w-full bg-[#f8f8f8] transition-all hover:border-[#8054e9] border border-[#f8f8f8] rounded-[13px] px-3 py-2 text-sm focus:outline-none">
                        <option>DD-MM-YYYY</option>
                        <option>MM-DD-YYYY</option>
                        <option>YYYY-MM-DD</option>
                    </select>
                </div>

                {/* Experimental Features */}
                <div>
                    <label className="block text-sm font-medium text-[#303030] mb-3">
                        Experimental Features
                    </label>
                    <button
                        onClick={() => setShowExperimental(!showExperimental)}
                        className="text-sm text-[#8054e9] font-medium hover:underline"
                    >
                        {showExperimental ? "Hide features" : "Show features"}
                    </button>

                    <AnimatePresence mode="wait">
                        {showExperimental && (
                            <motion.div
                                key="exp"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="mt-4 rounded-xl bg-[#efefef] border border-gray-200 p-4"
                            >
                                <p className="text-sm text-[#303030]">
                                    ✨ You are using early access features that may change or
                                    break unexpectedly.
                                </p>

                                {/* Toggles */}
                                <div className="mt-4 space-y-4">
                                    <ToggleRow
                                        label="Enable new sidebar layout"
                                        isOn={newSidebar}
                                        setIsOn={setNewSidebar}
                                    />
                                    <ToggleRow
                                        label="Try beta animations"
                                        isOn={betaAnimations}
                                        setIsOn={setBetaAnimations}
                                    />
                                    <ToggleRow
                                        label="Enable quick command menu"
                                        isOn={commandMenu}
                                        setIsOn={setCommandMenu}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
}

function ToggleRow({
    label,
    isOn,
    setIsOn,
}: {
    label: string;
    isOn: boolean;
    setIsOn: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between text-sm text-[#303030]">
            <span>{label}</span>

            <motion.button
                onClick={() => setIsOn(!isOn)}
                className={`relative w-11 h-6 rounded-full flex items-center ${isOn ? "bg-[#8054e9]" : "bg-gray-300"
                    }`}
                transition={{ duration: 0.25, ease: "easeInOut" }}
            >
                <motion.div
                    layout
                    transition={{
                        type: "spring",
                        stiffness: 600,
                        damping: 28,
                    }}
                    className="absolute w-5 h-5 bg-white rounded-full shadow-lg"
                    animate={{
                        x: isOn ? 22 : 2,
                        boxShadow: isOn
                            ? "0 0 10px rgba(128,84,233,0.5)"
                            : "0 1px 3px rgba(0,0,0,0.25)",
                    }}
                />
            </motion.button>
        </div>
    );
}
