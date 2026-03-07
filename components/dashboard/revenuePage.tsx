"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Sofa, Utensils, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DashboardOrder, getDashboardOrders } from "@/lib/dashboardService";

interface RevenueBreakdown {
  source: string;
  amount: number;
  percentage: number;
  change: number;
}

const CURRENCY = "R";

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short" });
}

function getRoomTypeFromOrder(order: DashboardOrder): string {
  if (order.orderType !== "room") return "Spa Services";
  return order.details.split(" • ")[0] || "Room";
}

function calcPercentChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function RevenueManagementClient() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);

  const fetchRevenueData = async () => {
    setIsDataLoading(true);
    try {
      const allOrders = await getDashboardOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch revenue data.");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    const hasSession = localStorage.getItem("dashboardAdminSession") === "true";

    if (!hasSession) {
      toast.error("Please sign in with admin credentials to access revenue.");
      router.push("/");
      setIsAuthLoading(false);
      return;
    }

    setIsAdminAuthenticated(true);
    setIsAuthLoading(false);
  }, [router]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchRevenueData();
    }
  }, [isAdminAuthenticated]);

  const approvedOrders = useMemo(
    () => orders.filter((o) => o.bookingStatus === "approved"),
    [orders]
  );

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: Date[] = [];
    for (let i = 5; i >= 0; i--) {
      months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
    }

    return months.map((monthStart) => {
      const revenue = approvedOrders
        .filter((order) => {
          const created = toDate(order.createdAt);
          return created ? sameMonth(created, monthStart) : false;
        })
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

      return { month: monthLabel(monthStart), revenue };
    });
  }, [approvedOrders]);

  const roomTypeData = useMemo(() => {
    const byRoomType = new Map<string, number>();

    approvedOrders
      .filter((order) => order.orderType === "room")
      .forEach((order) => {
        const roomType = getRoomTypeFromOrder(order);
        byRoomType.set(roomType, (byRoomType.get(roomType) || 0) + (order.totalPrice || 0));
      });

    return Array.from(byRoomType.entries())
      .map(([type, revenue]) => ({ type, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [approvedOrders]);

  const revenueMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentOrders = approvedOrders.filter((order) => {
      const created = toDate(order.createdAt);
      return created ? sameMonth(created, currentMonth) : false;
    });

    const previousOrders = approvedOrders.filter((order) => {
      const created = toDate(order.createdAt);
      return created ? sameMonth(created, previousMonth) : false;
    });

    const currentRoomRevenue = currentOrders
      .filter((order) => order.orderType === "room")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const currentServiceRevenue = currentOrders
      .filter((order) => order.orderType === "spa")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const previousRoomRevenue = previousOrders
      .filter((order) => order.orderType === "room")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const previousServiceRevenue = previousOrders
      .filter((order) => order.orderType === "spa")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const totalRevenue = currentRoomRevenue + currentServiceRevenue;
    const previousTotalRevenue = previousRoomRevenue + previousServiceRevenue;
    const totalRevenueChange = calcPercentChange(totalRevenue, previousTotalRevenue);
    const roomRevenueChange = calcPercentChange(currentRoomRevenue, previousRoomRevenue);
    const serviceRevenueChange = calcPercentChange(currentServiceRevenue, previousServiceRevenue);

    const avgPerBooking = currentOrders.length > 0 ? totalRevenue / currentOrders.length : 0;
    const previousAvgPerBooking =
      previousOrders.length > 0
        ? previousTotalRevenue / previousOrders.length
        : 0;
    const avgPerBookingChange = calcPercentChange(avgPerBooking, previousAvgPerBooking);

    const revenueBreakdown: RevenueBreakdown[] = [
      {
        source: "Room Bookings",
        amount: currentRoomRevenue,
        percentage: totalRevenue > 0 ? (currentRoomRevenue / totalRevenue) * 100 : 0,
        change: roomRevenueChange,
      },
      {
        source: "Spa Services",
        amount: currentServiceRevenue,
        percentage: totalRevenue > 0 ? (currentServiceRevenue / totalRevenue) * 100 : 0,
        change: serviceRevenueChange,
      },
    ];

    return {
      totalRevenue,
      totalRevenueChange,
      roomRevenue: currentRoomRevenue,
      roomRevenueChange,
      serviceRevenue: currentServiceRevenue,
      serviceRevenueChange,
      avgPerBooking,
      avgPerBookingChange,
      revenueBreakdown,
    };
  }, [approvedOrders]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] py-6 md:py-8">
      <div className="container mx-auto px-4 lg:px-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600 mt-1">Track and analyze hotel revenue and financial performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue - Blue Card */}
          <Card className="p-4 bg-linear-to-br from-[#2B7FFF] to-[#1f5dcc] border-0 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-white/80">
                {revenueMetrics.totalRevenueChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">{revenueMetrics.totalRevenueChange >= 0 ? "+" : ""}{revenueMetrics.totalRevenueChange.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs font-medium text-white/80">Total Revenue</p>
            <p className="text-2xl font-bold text-white mt-1">{CURRENCY}{revenueMetrics.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-white/70 mt-1">vs previous month</p>
          </Card>

          {/* Room Revenue */}
          <Card className="p-4 bg-white border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <Sofa className="h-6 w-6 text-teal-600" />
              </div>
              <div className="flex items-center gap-1 text-teal-600">
                {revenueMetrics.roomRevenueChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">{revenueMetrics.roomRevenueChange >= 0 ? "+" : ""}{revenueMetrics.roomRevenueChange.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">Room Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{CURRENCY}{revenueMetrics.roomRevenue.toLocaleString()}</p>
          </Card>

          {/* Service Revenue */}
          <Card className="p-4 bg-white border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Utensils className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                {revenueMetrics.serviceRevenueChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">{revenueMetrics.serviceRevenueChange >= 0 ? "+" : ""}{revenueMetrics.serviceRevenueChange.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">Service Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{CURRENCY}{revenueMetrics.serviceRevenue.toLocaleString()}</p>
          </Card>

          {/* Avg Per Booking */}
          <Card className="p-4 bg-white border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className={`flex items-center gap-1 ${revenueMetrics.avgPerBookingChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {revenueMetrics.avgPerBookingChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">{revenueMetrics.avgPerBookingChange >= 0 ? "+" : ""}{revenueMetrics.avgPerBookingChange.toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">Avg. Per Booking</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{CURRENCY}{Math.round(revenueMetrics.avgPerBooking).toLocaleString()}</p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Trend */}
          <Card className="p-6 bg-white border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  formatter={(value: any) => value != null ? `${CURRENCY}${Number(value).toLocaleString()}` : `${CURRENCY}0`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2B7FFF" 
                  strokeWidth={3}
                  dot={{ fill: "#2B7FFF", r: 5 }}
                  activeDot={{ r: 7 }}
                  name={`Revenue (${CURRENCY})`}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue by Room Type */}
          <Card className="p-6 bg-white border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Room Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="type" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  formatter={(value: any) => value != null ? `${CURRENCY}${Number(value).toLocaleString()}` : `${CURRENCY}0`}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Revenue Breakdown Table */}
        <Card className="p-6 bg-white border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Breakdown</h2>
          <div className="overflow-x-auto onjean-themed-scrollbar">
            <table className="w-full min-w-200">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">SOURCE</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">AMOUNT</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">PERCENTAGE</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">CHANGE</th>
                </tr>
              </thead>
              <tbody>
                {isDataLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-sm text-gray-500 text-center">Loading revenue breakdown...</td>
                  </tr>
                ) : revenueMetrics.revenueBreakdown.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.source}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{CURRENCY}{Math.round(item.amount).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{item.percentage.toFixed(1)}%</td>
                      <td className={`px-4 py-4 text-sm font-medium ${item.change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {item.change >= 0 ? "+" : ""}{item.change.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
