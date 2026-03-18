import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Plus } from "lucide-react";

const orders = [
	{
		id: "FO-2026-001",
		customer: "Michael Chen",
		room: "Room 101",
		type: "Room Service",
		items: "Eggs Benedict x2, Cappuccino x2",
		total: 49.96,
		status: "Delivered",
		statusColor: "bg-purple-100 text-purple-700",
		orderTime: "2026-03-17 08:30 AM",
		deliveredTime: "2026-03-17 09:00 AM",
	},
	{
		id: "FO-2026-002",
		customer: "Emma Williams",
		room: "Room 205",
		type: "Room Service",
		items: "Grilled Salmon x1, Caesar Salad x1",
		total: 49.98,
		status: "Preparing",
		statusColor: "bg-blue-100 text-blue-700",
		orderTime: "2026-03-17 12:15 PM",
	},
	{
		id: "FO-2026-003",
		customer: "James Rodriguez",
		room: "Room 223",
		type: "Walk-in",
		items: "Beef Burger x1, Cappuccino x1",
		total: 25.98,
		status: "Completed",
		statusColor: "bg-green-100 text-green-700",
		orderTime: "2026-03-17 01:45 PM",
	},
	{
		id: "FO-2026-004",
		customer: "Sofia Anderson",
		room: "Room 408",
		type: "Room Service",
		items: "Margherita Pizza x1, Chocolate Lava Cake x2",
		total: 48.97,
		status: "Pending",
		statusColor: "bg-yellow-100 text-yellow-700",
		orderTime: "2026-03-17 06:30 PM",
	},
	{
		id: "FO-2026-005",
		customer: "David Kim",
		room: "Room 301",
		type: "Restaurant",
		items: "Club Sandwich x1, Fresh Fruit Platter x1",
		total: 28.98,
		status: "Completed",
		statusColor: "bg-green-100 text-green-700",
		orderTime: "2026-03-17 02:00 PM",
	},
	{
		id: "FO-2026-006",
		customer: "Isabella Martinez",
		room: "Room 223",
		type: "Room Service",
		items: "Pancake Stack x1, Fresh Fruit Plate x1",
		total: 62.94,
		status: "Delivered",
		statusColor: "bg-purple-100 text-purple-700",
		orderTime: "2026-03-17 12:11 PM",
	},
];

const statusCounts = {
	total: orders.length,
	pending: orders.filter((o) => o.status === "Pending").length,
	preparing: orders.filter((o) => o.status === "Preparing").length,
	completed: orders.filter((o) => o.status === "Completed").length,
	revenue: orders.reduce((sum, o) => sum + o.total, 0),
};

export function OrderPage() {
	return (
		<div className="p-6">
			<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Food Orders</h1>
			<p className="text-gray-600 mb-6">Track and manage all food orders from guests</p>

			{/* Search and Actions */}
			<div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
				<Input
					placeholder="Search by customer, order ID, or room number..."
					className="w-full md:w-96"
				/>
				<div className="flex gap-2 ml-auto">
					<Button variant="outline" className="flex items-center gap-2">
						<Download className="w-4 h-4" /> Export
					</Button>
					<Button className="bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center gap-2">
						<Plus className="w-4 h-4" /> Add Order (Walk-in)
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
				<div className="bg-white rounded-xl border p-4 flex flex-col items-center">
					<span className="text-2xl font-bold text-gray-900">{statusCounts.total}</span>
					<span className="text-gray-500 text-sm mt-1">Total Orders</span>
				</div>
				<div className="bg-white rounded-xl border p-4 flex flex-col items-center">
					<span className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</span>
					<span className="text-gray-500 text-sm mt-1">Pending</span>
				</div>
				<div className="bg-white rounded-xl border p-4 flex flex-col items-center">
					<span className="text-2xl font-bold text-blue-600">{statusCounts.preparing}</span>
					<span className="text-gray-500 text-sm mt-1">Preparing</span>
				</div>
				<div className="bg-white rounded-xl border p-4 flex flex-col items-center">
					<span className="text-2xl font-bold text-green-600">{statusCounts.completed}</span>
					<span className="text-gray-500 text-sm mt-1">Completed</span>
				</div>
				<div className="bg-white rounded-xl border p-4 flex flex-col items-center">
					<span className="text-2xl font-bold text-green-700">${statusCounts.revenue.toFixed(2)}</span>
					<span className="text-gray-500 text-sm mt-1">Total Revenue</span>
				</div>
			</div>

			{/* Orders Table */}
			<div className="bg-white rounded-xl border p-4 overflow-x-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-gray-500 text-xs uppercase">
							<th className="py-2 px-3 text-left">Order ID</th>
							<th className="py-2 px-3 text-left">Customer</th>
							<th className="py-2 px-3 text-left">Type</th>
							<th className="py-2 px-3 text-left">Items</th>
							<th className="py-2 px-3 text-left">Total</th>
							<th className="py-2 px-3 text-left">Status</th>
							<th className="py-2 px-3 text-left">Order Time</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<tr key={order.id} className="border-t last:border-b">
								<td className="py-2 px-3 font-medium text-gray-900">{order.id}</td>
								<td className="py-2 px-3">
									<div className="font-semibold text-gray-900">{order.customer}</div>
									<div className="text-xs text-gray-500">{order.room}</div>
								</td>
								<td className="py-2 px-3">
									<Badge className={
										order.type === "Room Service"
											? "bg-blue-100 text-blue-700"
											: order.type === "Walk-in"
											? "bg-green-100 text-green-700"
											: "bg-pink-100 text-pink-700"
									}>
										{order.type}
									</Badge>
								</td>
								<td className="py-2 px-3 text-gray-700">{order.items}</td>
								<td className="py-2 px-3 font-semibold text-gray-900">${order.total.toFixed(2)}</td>
								<td className="py-2 px-3">
									<Badge className={order.statusColor}>{order.status}</Badge>
								</td>
								<td className="py-2 px-3 text-gray-700">
									{order.orderTime}
									{order.status === "Delivered" && (
										<div className="text-xs text-gray-400 mt-1">Delivered: {order.deliveredTime}</div>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
