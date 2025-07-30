import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}