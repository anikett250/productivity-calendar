"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Theme() {
  const [accent, setAccent] = useState("#8054e9");
  const [accentHover, setAccentHover] = useState("#6c44d1");
  const [userId, setUserId] = useState<string | null>(null);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "system";
    }

    return "system";
  });

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => setUserId(data.userId));
  }, []);

  const applyTheme = (selectedTheme: string) => {
    if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");

    } else if (selectedTheme === "light") {
      document.documentElement.classList.remove("dark");

    } else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (systemDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, []);

  const applyAccentVars = (c: string, h: string) => {
    document.documentElement.style.setProperty("--accent", c);
    document.documentElement.style.setProperty("--accent-hover", h);
  };

  // load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = localStorage.getItem("theme");
    const savedAccent = localStorage.getItem("accent");
    const savedAccentHover = localStorage.getItem("accentHover");

    if (savedTheme) setTheme(savedTheme);
    if (savedAccent && savedAccentHover) {
      setAccent(savedAccent);
      setAccentHover(savedAccentHover);
      applyAccentVars(savedAccent, savedAccentHover);
    } else applyAccentVars(accent, accentHover);
  }, []);

  const saveToDB = async (t: string, a: string, ah: string) => {
    try {
      await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: t, accent: a, accentHover: ah }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const savedAccent = localStorage.getItem(`${userId}_accent`);
    const savedAccentHover = localStorage.getItem(`${userId}_accentHover`);

    if (savedAccent && savedAccentHover) {
      setAccent(savedAccent);
      setAccentHover(savedAccentHover);
      applyAccentVars(savedAccent, savedAccentHover);
    }
  }, [userId]);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleChange = () => {
      if (theme === "system") {
        if (media.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    handleChange();

    media.addEventListener("change", handleChange);

    return () =>
      media.removeEventListener("change", handleChange);

  }, [theme]);



  return (
    <div className="w-full h-full p-8 overflow-y-auto"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}>
      <h2 className="text-lg font-semibold mb-8">Theme</h2>

      {/* Theme */}
      <section className="mb-10">
        <h3 className="text-base font-semibold mb-4">Appearance</h3>

        <div className="space-y-3">
          {["light", "dark", "system"].map((option) => (
            <motion.button
              key={option}
              onClick={() => {
                setTheme(option);
                localStorage.setItem("theme", option);
                applyTheme(option);
                saveToDB(option, accent, accentHover);
              }}

              whileTap={{ scale: 0.97 }}
              className={`flex items-center justify-between w-full border rounded-[13px] px-4 py-3 text-sm capitalize transition-all ${theme === option
                ? "border-[var(--accent)] bg-[var(--card-hover)] text-[var(--accent)]"
                : "border-transparent hover:border-gray-300"
                }`}
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--text)",
              }}

            >
              {option === "system" ? "System default" : `${option} mode`}
              <motion.div
                className={`w-4 h-4 rounded-full border ${theme === option
                  ? "bg-[var(--accent)] border-[var(--accent)]"
                  : "border-gray-300"
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
    </div>
  );
}
