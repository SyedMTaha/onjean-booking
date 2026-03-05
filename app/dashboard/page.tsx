"use client";

import { useState } from "react";
import { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboardPage";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar sidebarOpen={sidebarOpen} />
        <main
          className={`flex-1 transition-all duration-300 mt-16 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-20"
          }`}
        >
          <DashboardClient />
        </main>
      </div>
    </div>
  );
}
