"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Theme() {
  const [theme, setTheme] = useState("system");
  const [accent, setAccent] = useState("#8054e9"); // default purple

  const accents = [
    "#8054e9", // purple
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#ef4444", // red
  ];

  return (
    <div className="w-full h-full bg-[#f8f8f8] text-black p-8 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-8">Theme</h2>

      {/* Theme mode */}
      <section className="mb-10">
        <h3 className="text-base font-semibold mb-4">Appearance</h3>

        <div className="space-y-3">
          {["light", "dark", "system"].map((option) => (
            <motion.button
              key={option}
              onClick={() => setTheme(option)}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center justify-between w-full border rounded-[13px] px-4 py-3 text-sm capitalize transition-all ${
                theme === option
                  ? "border-[#8054e9] bg-[#eee] text-[#8054e9]"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              {option === "system" ? "System default" : `${option} mode`}
              <motion.div
                className={`w-4 h-4 rounded-full border ${
                  theme === option ? "bg-[#8054e9] border-[#8054e9]" : "border-gray-300"
                }`}
                animate={{
                  scale: theme === option ? 1.1 : 1,
                  opacity: theme === option ? 1 : 0.7,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Accent Color Picker */}
      <section className="mb-10">
        <h3 className="text-base font-semibold mb-4">Accent color</h3>
        <div className="flex items-center gap-4">
          {accents.map((color) => (
            <motion.button
              key={color}
              onClick={() => setAccent(color)}
              className={`w-8 h-8 rounded-full border transition-all ${
                accent === color
                  ? "ring-2 ring-offset-2 ring-[#8054e9] scale-105"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </section>

      {/* Theme Preview */}
      <section>
        <h3 className="text-base font-semibold mb-4">Preview</h3>
        <motion.div
          key={theme + accent}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`p-6 rounded-xl border shadow-sm ${
            theme === "dark" ? "bg-[#1e1e1e] text-white" : "bg-white text-black"
          }`}
        >
          <div
            className="w-10 h-10 rounded-md mb-3"
            style={{ backgroundColor: accent }}
          />
          <p className="text-sm font-medium">This is a sample text preview.</p>
          <p className="text-xs text-gray-500 mt-1">
            Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)} | Accent:{" "}
            <span style={{ color: accent }}>{accent}</span>
          </p>
        </motion.div>
      </section>
    </div>
  );
}
