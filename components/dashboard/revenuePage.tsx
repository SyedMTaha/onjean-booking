"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Sofa, Utensils, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface RevenueBreakdown {
  source: string;
  amount: number;
  percentage: number;
  change: number;
}

export function RevenueManagementClient() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Mock monthly revenue data
  const monthlyData = [
    { month: "Jan", revenue: 52000 },
    { month: "Feb", revenue: 58000 },
    { month: "Mar", revenue: 62000 },
    { month: "Apr", revenue: 59000 },
    { month: "May", revenue: 65000 },
    { month: "Jun", revenue: 67000 },
  ];

  // Mock room type revenue data
  const roomTypeData = [
    { type: "Standard", revenue: 28000 },
    { type: "Deluxe", revenue: 22000 },
    { type: "Suite", revenue: 18000 },
    { type: "Penthouse", revenue: 11000 },
    { type: "Services", revenue: 5000 },
  ];

  // Revenue breakdown
  const revenueBreakdown: RevenueBreakdown[] = [
    { source: "Room Bookings", amount: 57450, percentage: 92, change: 12 },
    { source: "Additional Services", amount: 5000, percentage: 8, change: 8 },
  ];

  const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.amount, 0);

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
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">+18%</span>
              </div>
            </div>
            <p className="text-xs font-medium text-white/80">Total Revenue</p>
            <p className="text-2xl font-bold text-white mt-1">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-white/70 mt-1">+18% from last month</p>
          </Card>

          {/* Room Revenue */}
          <Card className="p-4 bg-white border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <Sofa className="h-6 w-6 text-teal-600" />
              </div>
              <div className="flex items-center gap-1 text-teal-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">+12%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">Room Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">$57,450</p>
          </Card>

          {/* Service Revenue */}
          <Card className="p-4 bg-white border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Utensils className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">+8%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">Service Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">$5,000</p>
          </Card>

          {/* Avg Per Booking */}
          <Card className="p-4 bg-white border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="h-4 w-4" />
                <span className="text-xs font-medium">-3%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">Avg. Per Booking</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">$735</p>
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
                  formatter={(value: any) => value != null ? `$${Number(value).toLocaleString()}` : "$0"}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2B7FFF" 
                  strokeWidth={3}
                  dot={{ fill: "#2B7FFF", r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Revenue ($)"
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
                  formatter={(value: any) => value != null ? `$${Number(value).toLocaleString()}` : "$0"}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Revenue Breakdown Table */}
        <Card className="p-6 bg-white border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">SOURCE</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">AMOUNT</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">PERCENTAGE</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">CHANGE</th>
                </tr>
              </thead>
              <tbody>
                {revenueBreakdown.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.source}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">${item.amount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{item.percentage}%</td>
                    <td className="px-4 py-4 text-sm font-medium text-emerald-600">+{item.change}%</td>
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
