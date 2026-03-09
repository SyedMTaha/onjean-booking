"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Bed, 
  DollarSign, 
  Users, 
  Settings,
  Utensils,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Playfair_Display } from "next/font/google";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { path: "/dashboard/rooms", label: "Rooms", icon: Bed },
  { path: "/dashboard/menu", label: "Menu", icon: Utensils },
  { path: "/dashboard/revenue", label: "Revenue", icon: DollarSign },
  { path: "/dashboard/customers", label: "Customers", icon: Users },
  { path: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-700 z-50 transition-all duration-300 flex flex-col ${
          isOpen ? "w-64" : "w-0 lg:w-20"
        } overflow-hidden`}
      >
        {/* Logo Section with Toggle */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-700">
          {isOpen ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-3">
                <img 
                  src="/logo/logo-2.png" 
                  alt="78 On Jean Logo" 
                  className="h-12 w-auto object-contain"
                />
                <div className="flex flex-col">
                  <span className={`${playfair.className} text-base font-semibold text-white leading-tight`}>
                    78 ON JEAN
                  </span>
                  <span className="text-[8px] text-gray-400 uppercase tracking-wider">
                    Admin Panel
                  </span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-800 shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <div className="w-full flex flex-col items-center gap-2">
              <img 
                src="/logo/logo-2.png" 
                alt="78 On Jean Logo" 
                className="h-10 w-auto object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="text-gray-400 hover:text-white hover:bg-gray-800 w-8 h-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="py-6 px-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                } ${!isOpen && "justify-center lg:px-2"}`}
              >
                <Icon className={`${isOpen ? "w-5 h-5" : "w-6 h-6"} shrink-0`} />
                {isOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button at Bottom */}
        <div className="border-t border-gray-700 p-3">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={`w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white ${
              !isOpen && "justify-center lg:px-2"
            }`}
          >
            <LogOut className={`${isOpen ? "w-5 h-5" : "w-6 h-6"} shrink-0`} />
            {isOpen && <span className="font-medium text-sm">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 text-white hover:bg-gray-800"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
    </>
  );
}
