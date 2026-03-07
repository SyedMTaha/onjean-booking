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
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar sidebarOpen={sidebarOpen} />
        <main
          className={`flex-1 transition-all duration-300 mt-16 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
