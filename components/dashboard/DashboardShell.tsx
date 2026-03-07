"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <DashboardNavbar sidebarOpen={sidebarOpen} />
        <main
          className={`flex-1 transition-all duration-300 mt-16 min-w-0 overflow-x-hidden ${
            sidebarOpen ? "lg:pl-64" : "lg:pl-20"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
