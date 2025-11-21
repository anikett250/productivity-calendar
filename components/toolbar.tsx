"use client";

import { useState } from "react";
import {
  LayoutGrid,
  Calendar,
  ClipboardList,
  Timer,
  Settings,
  CircleQuestionMark,
} from "lucide-react";
import { Nunito } from "next/font/google";
import Modal from "./Modal";
import SettingsPage from "./settings/settings";
import HelpMe from "./help";

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
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const buttons = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutGrid size={18} /> },
    { id: "schedule", label: "Events", icon: <Calendar size={18} /> },
    { id: "todo", label: "To - Do List", icon: <ClipboardList size={18} /> },
    { id: "timer", label: "Timer", icon: <Timer size={18} /> },
  ];
  const otherbuttons = [
    { id: "Settings", label: "Settings", icon: <Settings size={18} /> },
    { id: "CircleQuestionMark", label: "Help", icon: <CircleQuestionMark size={18} /> },
  ];

  return (
    <div className={`${englebertFont.className}`}>
      <div className="ml-6 mt-8 flex items-center gap-2 mb-8">
        <svg viewBox="0 0 24 24" version="1.1" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
          <g>
            <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" fillRule="nonzero"></path>
            <path d="M5,4 C5,2.89543 5.89543,2 7,2 L17,2 C18.1046,2 19,2.89543 19,4 L19,5.85926 C19,7.53103 18.1645,9.09219 16.7735,10.0195 L13.8028,12 L16.7735,13.9805 C18.1645,14.9078 19,16.469 19,18.1407 L19,20 C19,21.1046 18.1046,22 17,22 L7,22 C5.89543,22 5,21.1046 5,20 L5,18.1407 C5,16.469 5.83551,14.9078 7.2265,13.9805 L10.1972,12 L7.2265,10.0195 C5.83551,9.09219 5,7.53103 5,5.85926 L5,4 Z M12,10.7981 L15.6641,8.35542 C16.4987,7.79902 17,6.86232 17,5.85926 L17,4 L7,4 L7,5.85926 C7,6.86232 7.5013,7.79902 8.3359,8.35542 L12,10.7981 Z M12,13.2018 L8.3359,15.6446 C7.5013,16.201 7,17.1377 7,18.1407 L7,20 L17,20 L17,18.1407 C17,17.1377 16.4987,16.201 15.6641,15.6446 L12,13.2018 Z" fill="#8054e9"></path>
          </g>
        </svg>
        <span className="-ml-2 text-xl font-bold text-[#8054e9]">Kairos</span>
      </div>
      <div className="ml-6 space-y-4 text-[#303030]">
        <h1 className="text-sm font-medium tracking-wide">MAIN MENU</h1>

        <div className="flex flex-col text-[#757575] space-y-3 text-[15px] font-bold">
          {buttons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => {
                setActive(btn.id);
                onNavigate(btn.id);
              }}
              className={`flex items-center gap-5 px-6 py-3 rounded-[18px] transition-all duration-450
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

      {/* OTHER MENU */}
      <div className="ml-6 mt-10 max-w-50 space-y-4 text-[#303030]">
        <h1 className="text-sm font-medium tracking-wide">OTHER MENU</h1>

        <div className="flex flex-col text-[#757575] space-y-3 text-[15px] font-bold">
          {otherbuttons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => {
                setActive(btn.id);
                if (btn.id === "Settings") setShowSettings(true);
                if (btn.id === "CircleQuestionMark") setShowHelp(true);
              }}
              className={`flex items-center gap-5 px-6 py-3 rounded-[18px] transition-all duration-450
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

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)}>
        <SettingsPage />
      </Modal>

      {/* Help Modal */}
      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)}>
        <HelpMe />
      </Modal>
    </div>
  );
}
