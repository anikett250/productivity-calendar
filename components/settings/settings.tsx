"use client";

import React, { useState } from "react";
import Settingstoolbar from "./settingstoolbar";
import Account from "./account";
import General from "./general";
import Theme from "./theme";
import Subscription from "./subscription";

export default function Settings() {
  const [activeComponent, setActiveComponent] = useState("account");

  const renderComponent = () => {
    switch (activeComponent) {
      case "account":
        return <Account />;
      case "general":
        return <General />;
      case "theme":
        return <Theme />;
        // case "subscription":
        // return <Subscription />;
      default:
        return <Account />;
    }
  };

  return (
    <div className="flex w-full h-full bg-[#f8f8f8] overflow-hidden rounded-2xl"
    style={{
  backgroundColor: "var(--bg)",
  color: "var(--text)",
}}
>
      {/* Sidebar */}
      <div className="w-[260px] bg-white"
      style={{
  backgroundColor: "var(--bg)",
  color: "var(--text)",
}}
>
        <Settingstoolbar onNavigate={setActiveComponent} />
      </div>

      {/* Active Page */}
      <div className="flex-1 overflow-y-auto">{renderComponent()}</div>
    </div>
  );
}
