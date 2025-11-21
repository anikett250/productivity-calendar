"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useState } from "react";

export default function Subscription() {
  const [currentPlan, setCurrentPlan] = useState("Beginner");

  const plans = [
    {
      name: "Beginner",
      price: "Free",
      desc: "Basic features for getting started.",
      features: ["Limited storage", "Basic tools", "Community access"],
      highlight: false,
    },
    {
      name: "Pro",
      price: "$5/month",
      desc: "For productivity lovers who need more control.",
      features: [
        "Unlimited storage",
        "Priority support",
        "Advanced customization",
      ],
      highlight: true,
    },
    {
      name: "Team",
      price: "$9/month",
      desc: "Collaborate with your team in real-time.",
      features: [
        "Shared workspaces",
        "Collaboration tools",
        "Admin dashboard",
      ],
      highlight: false,
    },
  ];

  return (
    <div className="w-full h-full bg-[#f8f8f8] text-black p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-semibold">Subscription</h2>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="text-sm bg-[#8054e9] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-[#6e46cb] transition"
        >
          Manage billing
        </motion.button>
      </div>

      {/* Current Plan */}
      <section className="mb-10">
        <h3 className="text-base font-semibold mb-2">Your plan</h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm"
        >
          <p className="text-sm text-gray-500 mb-1">Current plan</p>
          <p className="text-lg font-semibold text-[#8054e9]">
            {currentPlan}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You’re currently using the {currentPlan} plan. Upgrade to unlock
            advanced features and better control.
          </p>
        </motion.div>
      </section>

      {/* Upgrade Plans */}
      <section>
        <h3 className="text-base font-semibold mb-4">Available plans</h3>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              whileHover={{ scale: 1.03 }}
              className={`rounded-2xl p-6 border transition-all duration-300 shadow-sm cursor-pointer ${
                plan.highlight
                  ? "border-[#8054e9] bg-[#f3edff]"
                  : "border-gray-200 bg-white hover:border-[#8054e9]/50"
              }`}
            >
              {/* Plan Title */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold">{plan.name}</h4>
                {plan.highlight && <Star size={18} className="text-[#8054e9]" />}
              </div>

              <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>

              {/* Price */}
              <p className="text-xl font-bold mb-4">{plan.price}</p>

              {/* Features */}
              <ul className="space-y-2 text-sm mb-6">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-gray-600">
                    <Check size={15} className="text-[#8054e9]" /> {feat}
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrentPlan(plan.name)}
                className={`w-full py-2 text-sm rounded-lg font-medium transition ${
                  currentPlan === plan.name
                    ? "bg-[#8054e9]/10 text-[#8054e9] border border-[#8054e9]"
                    : "bg-[#8054e9] text-white hover:bg-[#6e46cb]"
                }`}
              >
                {currentPlan === plan.name ? "Current Plan" : "Upgrade"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
