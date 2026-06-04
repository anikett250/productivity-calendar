"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, LifeBuoy, BookOpen, AlertCircle } from "lucide-react";

export default function HelpMe() {
  return (
    <div className="w-full h-full p-8 overflow-y-auto"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-lg font-semibold mb-2">Help & Support</h2>
        <p className="text-sm text-gray-500">
          Need help? Find quick answers or contact our support team.
        </p>
      </motion.div>

      {/* Common Questions */}
      <section className="mb-10">
        <h3 className="text-base font-semibold mb-4">Common Questions</h3>
        <div className="space-y-3">
          {[
            {
              q: "How do I change my password?",
              a: "Go to the Account section → Manage account → Change password. You’ll be redirected to your browser to confirm changes.",
            },
            {
              q: "How can I sync my data across devices?",
              a: "Ensure sync is enabled in General Settings. Your notes and events automatically sync across your devices.",
            },
            {
              q: "Can I export my data?",
              a: "Yes! Navigate to General → Data section and click on 'Export all data'.",
            },
          ].map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className=" rounded-xl p-4 shadow-sm"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--text)",
              }}
            >
              <p className="text-sm font-semibold mb-1"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                }}
              >
                {faq.q}
              </p>
              <p className="text-sm"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                }}
              >{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="mb-10">
        <h3 className="text-base font-semibold mb-4">Contact Support</h3>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className=" rounded-xl p-6 shadow-sm"
          style={{
            backgroundColor: "var(--bg)",
            color: "var(--text)",
          }}
        >
          <p className="text-sm text-gray-600 mb-3">
            Can’t find what you’re looking for? Reach out to us — we’ll respond
            as soon as possible.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 text-sm bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--accent-hover)] transition"
            >
              <Mail size={16} />
              Email Support
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 text-sm border border-[#8054e9] text-[#8054e9] px-4 py-2 rounded-lg hover:bg-[var(--accent)]/10 transition"
            >
              <MessageSquare size={16} />
              Chat with Us
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Quick Links */}
      <section>
        <h3 className="text-base font-semibold mb-4">Quick Links</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: <BookOpen size={18} />,
              title: "Documentation",
              desc: "Read user guides and feature walkthroughs.",
            },
            {
              icon: <LifeBuoy size={18} />,
              title: "Feedback",
              desc: "Share your thoughts or request a new feature.",
            },
            {
              icon: <AlertCircle size={18} />,
              title: "Report an Issue",
              desc: "Found a bug? Let us know so we can fix it quickly.",
            },
          ].map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="p-5 rounded-xl shadow-sm cursor-pointer hover:border-[#8054e9]/60"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--text)",
              }}
            >
              <div className="flex items-center gap-3 mb-2"
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                }}
              >
                {link.icon}
                <span className="font-semibold text-sm"
                  style={{
                    backgroundColor: "var(--bg)",
                    color: "var(--text)",
                  }}
                >
                  {link.title}
                </span>
              </div>
              <p className="text-xs text-gray-600">{link.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
