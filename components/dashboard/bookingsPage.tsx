"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Clock3, Download, Plus, Search, SlidersHorizontal, Users } from "lucide-react";
import { toast } from "sonner";
import { getAllBookings } from "@/lib/bookingService";

type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";

interface AdminBooking {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roomType?: string;
  checkInDate?: any;
  checkOutDate?: any;
  nights?: number;
  totalPrice?: number;
  bookingStatus?: BookingStatus;
  cardLast4?: string;
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: any): string {
  const date = parseDate(value);
  if (!date) return "-";
  return date.toLocaleDateString();
}

function isCheckedIn(booking: AdminBooking): boolean {
  if (booking.bookingStatus !== "approved") return false;
  const checkIn = parseDate(booking.checkInDate);
  const checkOut = parseDate(booking.checkOutDate);
  if (!checkIn || !checkOut) return false;

  const now = new Date();
  return now >= checkIn && now <= checkOut;
}

export function BookingsManagementClient() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus | "checked-in">("all");

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await getAllBookings();
      setBookings(data as AdminBooking[]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasSession = localStorage.getItem("dashboardAdminSession") === "true";

    if (!hasSession) {
      toast.error("Please sign in with admin credentials to access bookings.");
      router.push("/");
      setIsAuthLoading(false);
      return;
    }

    setIsAdminAuthenticated(true);
    setIsAuthLoading(false);
  }, [router]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchBookings();
    }
  }, [isAdminAuthenticated]);

  const filteredBookings = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const guestName = `${booking.firstName || ""} ${booking.lastName || ""}`.trim().toLowerCase();
      const roomName = (booking.roomType || "").toLowerCase();
      const email = (booking.email || "").toLowerCase();

      const matchesSearch =
        needle.length === 0 || guestName.includes(needle) || roomName.includes(needle) || email.includes(needle);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "checked-in"
            ? isCheckedIn(booking)
            : booking.bookingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const totals = useMemo(() => {
    return {
      total: bookings.length,
      confirmed: bookings.filter((b) => b.bookingStatus === "approved").length,
      checkedIn: bookings.filter((b) => isCheckedIn(b)).length,
      pending: bookings.filter((b) => b.bookingStatus === "pending").length,
    };
  }, [bookings]);

  const exportCsv = () => {
    const rows = filteredBookings.map((booking) => {
      const guest = `${booking.firstName || ""} ${booking.lastName || ""}`.trim() || "-";
      return {
        guest,
        room: booking.roomType || "-",
        checkIn: formatDate(booking.checkInDate),
        checkOut: formatDate(booking.checkOutDate),
        nights: booking.nights ?? "-",
        amount: booking.totalPrice ?? 0,
        payment: booking.cardLast4 ? `Card •••• ${booking.cardLast4}` : "-",
        status: booking.bookingStatus || "pending",
      };
    });

    const header = ["Guest", "Room", "Check-in", "Check-out", "Nights", "Amount", "Payment", "Status"];
    const csvBody = rows.map((row) => [
      row.guest,
      row.room,
      row.checkIn,
      row.checkOut,
      row.nights,
      row.amount,
      row.payment,
      row.status,
    ]);

    const csv = [header, ...csvBody]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-1">View and manage all hotel bookings</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-80 ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by guest, room, or email"
              className="h-10 pl-10 placeholder:text-gray-400 text-gray-900 border-gray-300 bg-white rounded-xl"
            />
          </div>

          <div className="relative min-w-45">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 mr-2 " />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | BookingStatus | "checked-in")}
              className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All statuses</option>
              <option value="approved">Confirmed</option>
              <option value="checked-in">Checked-in</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <Button variant="outline" onClick={exportCsv} className="h-10 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-xl lg:ml-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* <Button onClick={() => router.push("/book-now")} className="h-10 bg-[#2B7FFF] hover:bg-[#1f5dcc] text-white rounded-xl"> 
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.total}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.confirmed}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Checked-in</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.checkedIn}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.pending}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-0 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden">
          <div className="overflow-x-auto onjean-themed-scrollbar">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-3 font-semibold">Guest</th>
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 font-semibold">Check-in</th>
                  <th className="px-4 py-3 font-semibold">Check-out</th>
                  <th className="px-4 py-3 font-semibold">Nights</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading bookings...</td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No bookings found.</td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const guest = `${booking.firstName || ""} ${booking.lastName || ""}`.trim() || "-";
                    const status = booking.bookingStatus || "pending";
                    const statusClass =
                      status === "approved"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : status === "rejected"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : status === "cancelled"
                            ? "bg-gray-100 text-gray-700 border-gray-300"
                            : "bg-amber-100 text-amber-700 border-amber-300";

                    // Determine payment badge
                    const isCurrentlyCheckedIn = isCheckedIn(booking);
                    let paymentBadge;
                    let paymentBadgeClass;
                    
                    if (isCurrentlyCheckedIn) {
                      paymentBadge = "Checked-in";
                      paymentBadgeClass = "bg-[#8200DB]/10 text-[#8200DB] border-[#8200DB]/30";
                    } else if (status === "approved" && booking.cardLast4) {
                      paymentBadge = "Paid";
                      paymentBadgeClass = "bg-[#007A55]/10 text-[#007A55] border-[#007A55]/30";
                    } else if (status === "approved") {
                      paymentBadge = "Confirmed";
                      paymentBadgeClass = "bg-[#1447E6]/10 text-[#1447E6] border-[#1447E6]/30";
                    } else if (status === "pending") {
                      paymentBadge = "Pending";
                      paymentBadgeClass = "bg-amber-100 text-amber-700 border-amber-300";
                    } else {
                      paymentBadge = "-";
                      paymentBadgeClass = "";
                    }

                    return (
                      <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{guest}</p>
                          <p className="text-xs text-gray-500">{booking.email || "-"}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{booking.roomType || "-"}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDate(booking.checkInDate)}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDate(booking.checkOutDate)}</td>
                        <td className="px-4 py-3 text-gray-700">{booking.nights ?? "-"}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">R{(booking.totalPrice || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          {paymentBadge === "-" ? (
                            <span className="text-gray-700">-</span>
                          ) : (
                            <Badge variant="outline" className={`${paymentBadgeClass} capitalize`}>
                              {paymentBadge}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`${statusClass} capitalize`}>
                            {status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
