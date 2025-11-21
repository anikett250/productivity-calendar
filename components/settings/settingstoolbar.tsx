"use client";

import { useState } from "react";
import {
  UserRoundCog,
  CircleUserRound,
  Palette,
  Wallet,
} from "lucide-react";
import { Nunito } from "next/font/google";

const englebertFont = Nunito({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-englebert",
});

interface SidebarProps {
  onNavigate: (id: string) => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const [active, setActive] = useState("schedule");

  const buttons = [
      { id: "account", label: "Account", icon: <CircleUserRound size={18} /> },
      { id: "general", label: "General", icon: <UserRoundCog size={18} /> },
    { id: "theme", label: "Theme", icon: <Palette size={18} /> },
    { id: "subscription", label: "Subscription", icon: <Wallet size={18} /> },
  ];

  return (
    <div className={`${englebertFont.className}`}>
      <div className="ml-8 mt-10 max-w-45 space-y-4 text-[#303030]">
        <div className="flex flex-col text-[#757575] space-y-3 text-[15px] font-bold">
          {buttons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => {
                setActive(btn.id);
                onNavigate(btn.id);
              }}
              className={`flex items-center gap-5 px-5 py-3 rounded-[18px] transition-all duration-450
                ${
                  active === btn.id
                    ? "border border-[#8054e9] text-[#8054e9]"
                    : "border border-transparent hover:text-[#8054e9]"
                }
                focus:outline-none`}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
