import { getAllBookings, updateBookingStatus } from "@/lib/bookingService";
import { getAllSpaBookings, updateSpaBookingStatus } from "@/lib/spaBookingService";

export type OrderType = "room" | "spa";

export interface DashboardOrder {
  id: string;
  orderType: OrderType;
  bookingStatus: "pending" | "approved" | "rejected" | "cancelled";
  customerName: string;
  customerEmail: string;
  createdAt: any;
  totalPrice: number;
  details: string;
}

export async function getDashboardOrders(): Promise<DashboardOrder[]> {
  const [roomBookings, spaBookings] = await Promise.all([getAllBookings(), getAllSpaBookings()]);

  const mappedRoomOrders: DashboardOrder[] = roomBookings.map((item: any) => ({
    id: item.id,
    orderType: "room",
    bookingStatus: item.bookingStatus || "pending",
    customerName: `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unknown Guest",
    customerEmail: item.email || "-",
    createdAt: item.createdAt,
    totalPrice: item.totalPrice || 0,
    details: `${item.roomType || "Room"} • ${item.nights || 0} night(s) • ${item.guests || "-"} guest(s)`,
  }));

  const mappedSpaOrders: DashboardOrder[] = spaBookings.map((item: any) => ({
    id: item.id,
    orderType: "spa",
    bookingStatus: item.bookingStatus || "pending",
    customerName: item.guestName || "Unknown Guest",
    customerEmail: item.guestEmail || "-",
    createdAt: item.createdAt,
    totalPrice: item.totalPrice || 0,
    details: `${item.serviceName || "Spa Service"} • ${item.appointmentDate || "-"} ${item.appointmentTime || ""}`,
  }));

  return [...mappedRoomOrders, ...mappedSpaOrders].sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return dateB - dateA;
  });
}

export async function updateOrderStatus(
  orderType: OrderType,
  orderId: string,
  status: "approved" | "rejected" | "cancelled"
) {
  if (orderType === "room") {
    return updateBookingStatus(orderId, status);
  }

  return updateSpaBookingStatus(orderId, status);
}
