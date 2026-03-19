"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Search } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

// ── Status badge color ─────────────────────────────────────────────────────────
function getStatusColor(status: string) {
  switch (status) {
    case "pending":   return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "approved":  return "bg-green-100 text-green-700 border-green-200";
    case "preparing": return "bg-blue-100 text-blue-700 border-blue-200";
    case "ready":     return "bg-purple-100 text-purple-700 border-purple-200";
    case "completed": return "bg-gray-100 text-gray-600 border-gray-200";
    case "rejected":  return "bg-red-100 text-red-700 border-red-200";
    default:          return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export function OrdersPage() {
  // ✅ Fix: state declared first — handleExportCsv references orders so must come after
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const handleExportCsv = () => {
    const rows = orders.map(order => {
      const orderTotal = order.items?.reduce(
        (s: number, item: any) => s + item.price * item.quantity, 0
      ) ?? order.totalPrice ?? 0;
      return {
        id: order.id,
        customer: order.name || "-",
        phone: order.phone || "-",
        room: order.roomNumber || "-",
        type: order.orderType || "-",
        items: order.items?.map((item: any) => `${item.name} x${item.quantity}`).join(", ") || "-",
        total: orderTotal,
        status: order.status || "-",
        createdAt: order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : "-",
      };
    });

    const header = ["Order ID", "Customer", "Phone", "Room", "Type", "Items", "Total", "Status", "Order Time"];
    const csvBody = rows.map(row => [
      row.id, row.customer, row.phone, row.room, row.type,
      row.items, row.total, row.status, row.createdAt,
    ]);
    const csv = [header, ...csvBody]
      .map(line => line.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `food-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Update order status in Firestore ──────────────────────────────────────
  // ✅ Saves status string directly to DB: "approved", "rejected", "preparing", etc.
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "foodOrders", orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      toast.success(
        newStatus === "approved"
          ? "Order approved successfully."
          : newStatus === "rejected"
          ? "Order rejected."
          : `Order marked as ${newStatus}.`
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Real-time listener ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "foodOrders"),
      (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Most recent first
        fetched.sort((a: any, b: any) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });
        setOrders(fetched);
      }
    );
    return () => unsubscribe();
  }, []);

  // ── Filter by search ───────────────────────────────────────────────────────
  const filteredOrders = orders.filter(order => {
    const needle = search.trim().toLowerCase();
    const matchesSearch =
      !needle ||
      order.name?.toLowerCase().includes(needle) ||
      order.id?.toLowerCase().includes(needle) ||
      order.phone?.toLowerCase().includes(needle) ||
      order.roomNumber?.toLowerCase().includes(needle);

    const matchesStatus =
      statusFilter === "all" ? true : (order.status || "pending") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ── Summary counts ─────────────────────────────────────────────────────────
  const statusCounts = {
    total:     orders.length,
    pending:   orders.filter(o => !o.status || o.status === "pending").length,
    approved:  orders.filter(o => o.status === "approved").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    completed: orders.filter(o => o.status === "completed").length,
    rejected:  orders.filter(o => o.status === "rejected").length,
    revenue:   orders
      .filter(o => o.status !== "rejected")
      .reduce((sum, o) => {
        const t = o.items?.reduce(
          (s: number, item: any) => s + item.price * item.quantity, 0
        ) || o.totalPrice || 0;
        return sum + t;
      }, 0),
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#F8FAFC] py-6 md:py-8">
      <div className="container mx-auto px-4 lg:px-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Food Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage all food orders from guests</p>
        </div>

        {/* Search + Export */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by customer, phone or order ID"
              className="h-10 pl-10 placeholder:text-gray-400 text-gray-900 border-gray-300 bg-white rounded-xl"
            />
          </div>

          <div className="relative min-w-45">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 mr-2" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="preparing">Preparing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <Button
            variant="outline"
            className="h-10 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-xl lg:ml-auto flex items-center gap-2"
            onClick={handleExportCsv}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900">{statusCounts.total}</span>
            <span className="text-gray-500 text-xs mt-1">Total</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</span>
            <span className="text-gray-500 text-xs mt-1">Pending</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-green-600">{statusCounts.approved}</span>
            <span className="text-gray-500 text-xs mt-1">Approved</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-blue-600">{statusCounts.preparing}</span>
            <span className="text-gray-500 text-xs mt-1">Preparing</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-600">{statusCounts.completed}</span>
            <span className="text-gray-500 text-xs mt-1">Completed</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-red-600">{statusCounts.rejected}</span>
            <span className="text-gray-500 text-xs mt-1">Rejected</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center col-span-2 sm:col-span-1">
            <span className="text-2xl font-bold text-green-700">
              R{statusCounts.revenue.toFixed(2)}
            </span>
            <span className="text-gray-500 text-xs mt-1">Revenue</span>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {search ? "No orders match your search." : "No orders found yet."}
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Order ID</th>
                  <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Customer</th>
                  <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Type</th>
                  <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Items</th>
                  <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Total</th>
                  <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Time</th>
                  <th className="py-3 px-4 text-left font-semibold whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const orderTotal =
                    order.items?.reduce(
                      (s: number, item: any) => s + item.price * item.quantity, 0
                    ) ?? order.totalPrice ?? 0;

                  const currentStatus = order.status || "pending";
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr key={order.id} className="border-t hover:bg-gray-50 transition-colors">

                      {/* Order ID */}
                      <td className="py-3 px-4 font-mono font-medium text-gray-900 text-xs whitespace-nowrap">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900 text-sm">{order.name || "-"}</div>
                        <div className="text-xs text-gray-500">{order.phone || "-"}</div>
                        {order.roomNumber && (
                          <div className="text-xs text-gray-400">Room {order.roomNumber}</div>
                        )}
                      </td>

                      {/* Order Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={
                            order.orderType === "room-service"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : order.orderType === "dine-in"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-pink-50 text-pink-700 border-pink-200"
                          }
                        >
                          {order.orderType?.replace(/-/g, " ") || "-"}
                        </Badge>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4 text-gray-700 max-w-[180px]">
                        <div className="truncate text-xs">
                          {order.items
                            ?.map((item: any) => `${item.name} x${item.quantity}`)
                            .join(", ") || "-"}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                        R{orderTotal.toFixed(2)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge variant="outline" className={getStatusColor(currentStatus)}>
                          {currentStatus}
                        </Badge>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleString()
                          : "-"}
                      </td>

                      {/* ✅ Actions column */}
                      <td className="py-3 px-4 whitespace-nowrap">

                        {/* pending → Approve / Reject */}
                        {currentStatus === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-3 rounded-lg disabled:opacity-50"
                              onClick={() => handleStatusUpdate(order.id, "approved")}
                            >
                              {isUpdating ? "..." : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              disabled={isUpdating}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 px-3 rounded-lg disabled:opacity-50"
                              onClick={() => handleStatusUpdate(order.id, "rejected")}
                            >
                              {isUpdating ? "..." : "Reject"}
                            </Button>
                          </div>
                        )}

                        {/* approved → Start Preparing */}
                        {currentStatus === "approved" && (
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-3 rounded-lg disabled:opacity-50"
                            onClick={() => handleStatusUpdate(order.id, "preparing")}
                          >
                            {isUpdating ? "..." : "Start Preparing"}
                          </Button>
                        )}

                        {/* preparing → Mark Ready */}
                        {currentStatus === "preparing" && (
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-3 rounded-lg disabled:opacity-50"
                            onClick={() => handleStatusUpdate(order.id, "ready")}
                          >
                            {isUpdating ? "..." : "Mark Ready"}
                          </Button>
                        )}

                        {/* ready → Complete */}
                        {currentStatus === "ready" && (
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            className="bg-gray-600 hover:bg-gray-700 text-white text-xs h-7 px-3 rounded-lg disabled:opacity-50"
                            onClick={() => handleStatusUpdate(order.id, "completed")}
                          >
                            {isUpdating ? "..." : "Complete"}
                          </Button>
                        )}

                        {/* completed or rejected — no more actions */}
                        {(currentStatus === "completed" || currentStatus === "rejected") && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}