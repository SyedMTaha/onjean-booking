"use client";
interface DashboardNavbarProps {
  sidebarOpen: boolean;
}

import { User, ChevronDown, LogOut, Home, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardOrders } from "@/lib/dashboardService";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function DashboardNavbar({ sidebarOpen }: DashboardNavbarProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const [roomOrders, setRoomOrders] = useState<any[]>([]);
  const [foodOrders, setFoodOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      // Fetch room and spa orders
      try {
        const dashboardOrders = await getDashboardOrders();
        setRoomOrders(dashboardOrders.filter(order => order.bookingStatus === "pending"));
      } catch (e) {
        setRoomOrders([]);
      }
      // Fetch food orders
      try {
        const foodOrdersQuery = query(
          collection(db, "foodOrders"),
          where("orderStatus", "==", "pending"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(foodOrdersQuery);
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFoodOrders(orders);
      } catch (e) {
        setFoodOrders([]);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

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
      <div className="h-full px-4 lg:px-6 flex items-center justify-end gap-4">
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

        {/* Notification Bell & Profile - Right aligned */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2 rounded-full hover:bg-gray-100 mr-2">
                  <Bell className="w-6 h-6 text-gray-700" />
                  {/* TODO: Add badge for new notifications */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80 rounded-xl border border-gray-200 p-2 shadow-lg bg-white" sideOffset={8} style={{ minWidth: '20rem', zIndex: 50 }}>
                <div className="font-semibold text-lg mb-2">Notifications</div>
                {loading ? (
                  <div className="text-black text-sm">Loading...</div>
                ) : (
                  <>
                    {roomOrders.length === 0 && foodOrders.length === 0 ? (
                      <div className="text-black text-sm">No new notifications</div>
                    ) : (
                      <>
                        {roomOrders.length > 0 && (
                          <div className="mb-2">
                            <div className="font-medium text-blue-600 mb-1">Room Orders</div>
                            {roomOrders.map(order => (
                              <div key={order.id} className="bg-blue-50 rounded-lg p-2 mb-1 text-sm">
                                <div className="font-semibold text-black">{order.customerName}</div>
                                <div className="text-xs text-gray-800">{order.details}</div>
                                <div className="text-xs text-gray-700">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : order.createdAt}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {foodOrders.length > 0 && (
                          <div>
                            <div className="font-medium text-green-600 mb-1">Food Orders</div>
                            {foodOrders.map(order => (
                              <div key={order.id} className="bg-green-50 rounded-lg p-2 mb-1 text-sm">
                                <div className="font-semibold text-black">{order.userName}</div>
                                <div className="text-xs text-gray-800">{order.items?.length} item(s) • R{order.totalPrice}</div>
                                <div className="text-xs text-gray-700">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : order.createdAt}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Divider */}
          <Separator orientation="vertical" className="mx-4 h-8 bg-gray-200" />
          {/* Profile Dropdown */}
          <div className="flex items-center">
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
                  onClick={() => router.push("/")}
                  className="group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-800 outline-none hover:bg-gray-100 focus:bg-gray-100"
                >
                  <Home className="h-4 w-4 text-black" />
                  <span>Go to Website</span>
                </DropdownMenuItem>
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
      </div>
    </nav>
  );
}
