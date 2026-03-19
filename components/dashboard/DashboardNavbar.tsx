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
      // Fetch pending room/spa orders
      try {
        const dashboardOrders = await getDashboardOrders();
        setRoomOrders(dashboardOrders.filter(order => order.bookingStatus === "pending"));
      } catch {
        setRoomOrders([]);
      }
      // Fetch pending food orders
      // ✅ Fixed: query uses "status" field not "orderStatus" to match foodOrderService
      try {
        const foodOrdersQuery = query(
          collection(db, "foodOrders"),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(foodOrdersQuery);
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFoodOrders(orders);
      } catch {
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
    } catch {
      toast.error("Failed to sign out");
    }
  };

  // ✅ Total unread count for red dot
  const unreadCount = roomOrders.length + foodOrders.length;

  return (
    <nav
      className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-40 transition-all duration-300 ${
        sidebarOpen ? "left-64" : "left-0 lg:left-20"
      }`}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-end">

        {/* ── Right side: Bell | Divider | Profile ──────────────────────── */}
        <div className="flex items-center gap-3">

          {/* ── Bell notification icon ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative p-2 rounded-full hover:bg-gray-100"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {/* ✅ Red dot — only shown when there are unread notifications */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-80 rounded-xl border border-gray-200 shadow-lg bg-white p-3"
              style={{ zIndex: 50 }}
            >
              {/* Dropdown header */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-base text-gray-900">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {loading ? (
                <p className="text-sm text-gray-500 py-2">Loading...</p>
              ) : unreadCount === 0 ? (
                <p className="text-sm text-gray-500 py-2 text-center">
                  No new notifications
                </p>
              ) : (
                <div className="space-y-3">
                  {/* Room Orders section */}
                  {roomOrders.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1.5">
                        Room Orders ({roomOrders.length})
                      </p>
                      <div className="space-y-1.5">
                        {roomOrders.map(order => (
                          <div
                            key={order.id}
                            className="bg-blue-50 border border-blue-100 rounded-lg p-2.5"
                          >
                            <p className="text-sm font-semibold text-gray-900">
                              {order.customerName}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {order.details}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {order.createdAt?.toDate
                                ? order.createdAt.toDate().toLocaleString()
                                : order.createdAt}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Food Orders section */}
                  {foodOrders.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1.5">
                        Food Orders ({foodOrders.length})
                      </p>
                      <div className="space-y-1.5">
                        {foodOrders.map(order => {
                          // Derive a readable label and colour from orderType
                          const typeLabel =
                            order.orderType === "room-service" ? "Room Service"
                            : order.orderType === "dine-in" ? "Dine-in"
                            : order.orderType === "take-away" ? "Takeaway"
                            : "Food Order";

                          const typePill =
                            order.orderType === "room-service"
                              ? "bg-blue-100 text-blue-700"
                              : order.orderType === "dine-in"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-pink-100 text-pink-700";

                          return (
                            <div
                              key={order.id}
                              className="bg-green-50 border border-green-100 rounded-lg p-2.5"
                            >
                              {/* Customer name + order type pill on same row */}
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {order.name || order.userName || "Guest"}
                                </p>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${typePill}`}>
                                  {typeLabel}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">
                                {order.items?.length} item(s) &bull; R
                                {order.items
                                  ?.reduce(
                                    (s: number, i: any) => s + i.price * i.quantity,
                                    0
                                  )
                                  .toFixed(2) ?? order.totalPrice}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {order.createdAt?.toDate
                                  ? order.createdAt.toDate().toLocaleString()
                                  : order.createdAt}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ✅ Divider — now correctly between bell and profile */}
          <Separator orientation="vertical" className="h-8 bg-gray-200" />

          {/* ── Profile Dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-gray-100 px-2"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:block font-medium text-gray-700 text-sm">
                  Admin
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-44 rounded-xl border border-gray-200 p-1.5 shadow-lg bg-white"
              style={{ zIndex: 50 }}
            >
              <DropdownMenuItem
                onClick={() => router.push("/")}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-800 outline-none hover:bg-gray-100 focus:bg-gray-100"
              >
                <Home className="h-4 w-4 text-gray-600" />
                <span>Go to Website</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 outline-none hover:bg-red-50 focus:bg-red-50"
              >
                <LogOut className="h-4 w-4 text-red-500" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
        {/* ── End right side ── */}

      </div>
    </nav>
  );
}