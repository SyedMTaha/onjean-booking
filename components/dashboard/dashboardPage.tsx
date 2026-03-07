"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BedDouble, CalendarCheck, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  DashboardOrder,
  getDashboardOrders,
  updateOrderStatus,
} from "@/lib/dashboardService";
import { rooms } from "@/data/rooms";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
  cancelled: "#6b7280",
};

const ORDER_TYPE_COLORS: Record<string, string> = {
  room: "#1d4ed8",
  spa: "#7c3aed",
};

function formatCreatedAt(createdAt: any) {
  if (!createdAt) return "-";
  if (createdAt?.toDate) {
    return createdAt.toDate().toLocaleString();
  }
  return "-";
}

function isCurrentMonth(createdAt: any) {
  if (!createdAt?.toDate) return false;
  const date = createdAt.toDate();
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function getStatusBadgeClass(status: string) {
  if (status === "approved") return "bg-green-100 text-green-700 border-green-300";
  if (status === "rejected") return "bg-red-100 text-red-700 border-red-300";
  if (status === "cancelled") return "bg-gray-100 text-gray-700 border-gray-300";
  return "bg-amber-100 text-amber-700 border-amber-300";
}

function getOrderTypeBadgeClass(orderType: "room" | "spa") {
  if (orderType === "room") return "bg-blue-100 text-blue-700 border-blue-300";
  return "bg-violet-100 text-violet-700 border-violet-300";
}

export function DashboardClient() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const router = useRouter();

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const allOrders = await getDashboardOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const hasSession = localStorage.getItem("dashboardAdminSession") === "true";
        
        if (!hasSession) {
          toast.error("Please sign in with admin credentials to access the dashboard.");
          router.push("/");
          return;
        }
        
        setIsAdminAuthenticated(hasSession);
      } catch (error) {
        console.error(error);
        toast.error("Failed to initialize dashboard authentication.");
        router.push("/");
      } finally {
        setIsAuthLoading(false);
      }
    };

    bootstrap();
  }, [router]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchOrders();
    }
  }, [isAdminAuthenticated]);

  const handleStatusUpdate = async (
    order: DashboardOrder,
    status: "approved" | "rejected"
  ) => {
    try {
      await updateOrderStatus(order.orderType, order.id, status);
      toast.success(`Order ${status}.`);
      fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order status.");
    }
  };

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      counts[order.bookingStatus] = (counts[order.bookingStatus] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [orders]);

  const orderTypeData = useMemo(() => {
    const counts: Record<string, number> = { room: 0, spa: 0 };
    orders.forEach((order) => {
      counts[order.orderType] = (counts[order.orderType] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Booking Trends Data (mock data for demonstration)
  const bookingTrendsData = [
    { month: "Sep", bookings: 45, revenue: 28 },
    { month: "Oct", bookings: 52, revenue: 35 },
    { month: "Nov", bookings: 60, revenue: 42 },
    { month: "Dec", bookings: 78, revenue: 58 },
    { month: "Jan", bookings: 65, revenue: 48 },
    { month: "Feb", bookings: 72, revenue: 52 },
    { month: "Mar", bookings: 88, revenue: 62 },
  ];

  // Monthly Income Distribution Data
  const incomeDistributionData = [
    { name: "Standard Rooms", value: 35, color: "#3B82F6" },
    { name: "Deluxe Rooms", value: 28, color: "#A855F7" },
    { name: "Suites", value: 20, color: "#06B6D4" },
    { name: "Penthouse", value: 12, color: "#10B981" },
    { name: "Services", value: 5, color: "#F59E0B" },
  ];

  const totals = useMemo(() => {
    const totalRooms = rooms.length;
    const pendingBookings = orders.filter((o) => o.bookingStatus === "pending").length;
    const approvedRoomBookings = orders.filter(
      (o) => o.orderType === "room" && o.bookingStatus === "approved"
    ).length;
    const roomsOccupied = Math.min(totalRooms, approvedRoomBookings);
    const roomsAvailable = Math.max(totalRooms - roomsOccupied, 0);
    const monthlyRevenue = orders
      .filter((o) => o.bookingStatus === "approved" && isCurrentMonth(o.createdAt))
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    return {
      totalBookings: orders.length,
      pendingBookings,
      roomsAvailable,
      roomsOccupied,
      monthlyRevenue,
    };
  }, [orders]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] py-6 md:py-8">
      <div className="container mx-auto px-4 lg:px-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your hotel today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.totalBookings}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <CalendarCheck className="h-5 w-5" />
              </div>
            </div>
            <Badge variant="outline" className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              {totals.pendingBookings} pending
            </Badge>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Rooms Available</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.roomsAvailable}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <BedDouble className="h-5 w-5" />
              </div>
            </div>
            <Badge variant="outline" className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              Live availability
            </Badge>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Rooms Occupied</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.roomsOccupied}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <BedDouble className="h-5 w-5" />
              </div>
            </div>
            <Badge variant="outline" className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              Active stays
            </Badge>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">R{totals.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-[#FFF4DE] text-[#FE9A00] flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <Badge variant="outline" className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-700">
              Current month
            </Badge>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders By Status</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#9ca3af"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders By Type</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderTypeData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {orderTypeData.map((entry) => (
                      <Cell key={entry.name} fill={ORDER_TYPE_COLORS[entry.name] || "#9ca3af"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Booking Trends and Room Availability Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Booking Trends Chart */}
          <Card className="xl:col-span-2 p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Total Bookings"
                    dot={{ fill: "#3B82F6", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#A855F7"
                    strokeWidth={2}
                    name="Revenue (in thousands)"
                    dot={{ fill: "#A855F7", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Room Availability */}
          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Room Availability</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Available Rooms</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">{totals.roomsAvailable}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Reserved Rooms</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">{totals.pendingBookings}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-rose-500 text-white flex items-center justify-center">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Occupied Rooms</span>
                  </div>
                  <span className="text-2xl font-bold text-rose-600">{totals.roomsOccupied}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Income Distribution */}
        <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income Distribution</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {incomeDistributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Button className="bg-[#F1F5F9] text-gray-900 hover:bg-gray-200 rounded-xl" onClick={fetchOrders}>Refresh</Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-gray-600">No orders found yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Guest Name</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Order Type</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Check-In Date</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Details</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Total Price</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Booking Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={`${order.orderType}-${order.id}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-sm text-gray-600">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="outline"
                          className={`uppercase ${getOrderTypeBadgeClass(order.orderType)}`}
                        >
                          {order.orderType}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {formatCreatedAt(order.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700 max-w-xs truncate">
                        {order.details}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                        R{order.totalPrice.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={getStatusBadgeClass(order.bookingStatus)}>
                          {order.bookingStatus}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {order.bookingStatus === "pending" ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 rounded-xl"
                              onClick={() => handleStatusUpdate(order, "approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                              onClick={() => handleStatusUpdate(order, "rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
