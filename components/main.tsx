"use client";
import React, { useState } from "react";
import Toolbar from "./toolbar";
import Calendar from "./Calendar";
import Events from "./events";
import Todo from "./todo";
import Timer from "./timer";

export default function Main() {
  const [activeComponent, setActiveComponent] = useState('dashboard');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <Calendar />;
      case 'schedule':
        return <Events />;
      case 'todo':
        return <Todo />;
        case 'timer':
        return <Timer/>;
      default:
        return <Calendar />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f8f8]">
      <div className="w-64 border-r border-gray-100">
        <Toolbar onNavigate={setActiveComponent} />
      </div>
      <div className="flex-1">
        {renderComponent()}
      </div>
    </div>
  );
}
