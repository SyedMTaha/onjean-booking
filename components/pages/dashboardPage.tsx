"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ensureDefaultAdminCredentials } from "@/lib/adminService";
import {
  DashboardOrder,
  getDashboardOrders,
  updateOrderStatus,
} from "@/lib/dashboardService";

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

function getStatusBadgeClass(status: string) {
  if (status === "approved") return "bg-green-100 text-green-700 border-green-300";
  if (status === "rejected") return "bg-red-100 text-red-700 border-red-300";
  if (status === "cancelled") return "bg-gray-100 text-gray-700 border-gray-300";
  return "bg-amber-100 text-amber-700 border-amber-300";
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
        await ensureDefaultAdminCredentials();
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

  const handleLogout = () => {
    localStorage.removeItem("dashboardAdminSession");
    setIsAdminAuthenticated(false);
    setOrders([]);
    toast.success("Logged out successfully.");
    router.push("/");
  };

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

  const totals = useMemo(() => {
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.bookingStatus === "pending").length,
      approvedOrders: orders.filter((o) => o.bookingStatus === "approved").length,
      totalRevenue: orders
        .filter((o) => o.bookingStatus === "approved")
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
    };
  }, [orders]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 md:py-12">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor customer orders and approve bookings.</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-5">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.totalOrders}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-3xl font-semibold text-amber-600 mt-2">{totals.pendingOrders}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-3xl font-semibold text-green-600 mt-2">{totals.approvedOrders}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-gray-600">Approved Revenue</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">R{totals.totalRevenue.toLocaleString()}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="p-5">
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

          <Card className="p-5">
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

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Customer Orders</h2>
            <Button variant="outline" onClick={fetchOrders}>Refresh</Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-gray-600">No orders found yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={`${order.orderType}-${order.id}`} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{order.customerName}</p>
                        <Badge variant="outline" className="uppercase">
                          {order.orderType}
                        </Badge>
                        <Badge variant="outline" className={getStatusBadgeClass(order.bookingStatus)}>
                          {order.bookingStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{order.customerEmail}</p>
                      <p className="text-sm text-gray-700">{order.details}</p>
                      <p className="text-sm text-gray-600">Created: {formatCreatedAt(order.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-lg font-semibold text-gray-900 mr-2">R{order.totalPrice.toLocaleString()}</p>
                      {order.bookingStatus === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusUpdate(order, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(order, "rejected")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
