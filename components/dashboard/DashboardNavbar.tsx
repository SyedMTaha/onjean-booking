"use client";

import { User, ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface DashboardNavbarProps {
  sidebarOpen: boolean;
}

export function DashboardNavbar({ sidebarOpen }: DashboardNavbarProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("dashboardAdminSession");
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <nav
      className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-40 transition-all duration-300 ${
        sidebarOpen ? "left-64" : "left-0 lg:left-20"
      }`}
    >
      <div className="h-full px-4 lg:px-6 flex items-center gap-4">
        {/* Search Bar */}
        {/* <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white text-black"
            />
          </div>
        </div> */}

        {/* Right Section - Profile */}
        <div className="flex items-center ml-auto">
          {/* Admin Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="hidden md:block font-medium text-gray-700">
                  Admin
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-xl border border-gray-200 p-1.5 shadow-lg bg-white"
              sideOffset={8}
              style={{ minWidth: '11rem', zIndex: 50 }}
            >
              <DropdownMenuItem
                onClick={handleLogout}
                className="group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 outline-none hover:bg-red-50 focus:bg-red-50"
              >
                <LogOut className="h-4 w-4 text-red-500 group-hover:text-red-600" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
