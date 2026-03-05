"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getUserBookings } from "@/lib/bookingService";
import { CalendarDays, Hotel, LogIn } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type UserBooking = {
  id: string;
  bookingStatus?: "pending" | "approved" | "rejected" | "cancelled";
  roomType?: string;
  roomPrice?: number;
  totalPrice?: number;
  nights?: number;
  guests?: string;
  checkInDate?: any;
  checkOutDate?: any;
  createdAt?: any;
};

function formatDate(value: any) {
  if (!value) return "-";
  if (value?.toDate) return value.toDate().toLocaleDateString();

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function getStatusClass(status: UserBooking["bookingStatus"]) {
  if (status === "approved") return "bg-green-100 text-green-700 border-green-200";
  if (status === "rejected") return "bg-red-100 text-red-700 border-red-200";
  if (status === "cancelled") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-amber-100 text-amber-700 border-amber-200";
}

export function MyBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<UserBooking[]>([]);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        setBookings([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const userBookings = await getUserBookings(user.uid);
        setBookings(userBookings as UserBooking[]);
      } catch (error) {
        console.error("Failed to fetch user bookings", error);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [user]);

  const totalSpent = useMemo(
    () =>
      bookings
        .filter((booking) => booking.bookingStatus === "approved")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
    [bookings]
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 md:py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-gray-600 text-base md:text-lg mb-8">Track your room reservation history</p>

          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
            <div className="mb-6">
              <LogIn className="w-16 h-16 mx-auto text-gray-300" />
            </div>
            <p className="text-gray-600 text-lg mb-8">Please sign in to view your bookings</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 text-base"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 md:py-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-gray-600">Loading your reservations...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 md:py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-gray-600 text-base md:text-lg mb-8">Track your room reservation history</p>

          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
            <div className="mb-6">
              <Hotel className="w-16 h-16 mx-auto text-gray-300" />
            </div>
            <p className="text-gray-600 text-lg mb-8">No room bookings found yet</p>
            <Button
              onClick={() => router.push("/rooms")}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 text-base"
            >
              Explore Rooms
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 md:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600 text-base md:text-lg">
            {bookings.length} {bookings.length === 1 ? "reservation" : "reservations"} found
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {bookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className={`p-6 md:p-8 ${
                    index !== bookings.length - 1 ? "border-b border-gray-200" : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <p className="text-xl font-semibold text-gray-900">{booking.roomType || "Room"}</p>
                        <span
                          className={`text-xs uppercase tracking-wide px-2.5 py-1 rounded-full border ${getStatusClass(
                            booking.bookingStatus
                          )}`}
                        >
                          {booking.bookingStatus || "pending"}
                        </span>
                      </div>

                      <div className="space-y-2 text-gray-700">
                        <p>
                          <span className="font-medium text-gray-900">Booking ID:</span> {booking.id}
                        </p>
                        <p>
                          <span className="font-medium text-gray-900">Guests:</span> {booking.guests || "-"}
                        </p>
                        <p>
                          <span className="font-medium text-gray-900">Nights:</span> {booking.nights || 0}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-amber-600">
                        R {(booking.totalPrice || booking.roomPrice || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="font-medium text-gray-900 mb-1">Check-in</p>
                      <p>{formatDate(booking.checkInDate)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="font-medium text-gray-900 mb-1">Check-out</p>
                      <p>{formatDate(booking.checkOutDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 sticky top-24">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">Summary</h2>

              <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Bookings</span>
                  <span className="font-semibold text-gray-900">{bookings.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Approved</span>
                  <span className="font-semibold text-gray-900">
                    {bookings.filter((booking) => booking.bookingStatus === "approved").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Pending</span>
                  <span className="font-semibold text-gray-900">
                    {bookings.filter((booking) => booking.bookingStatus === "pending").length}
                  </span>
                </div>
              </div>

              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex justify-between items-end">
                  <span className="text-xl font-semibold text-gray-900">Approved Spend</span>
                  <span className="text-2xl md:text-3xl font-bold text-amber-600">
                    R {totalSpent.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 md:py-4 text-base md:text-lg rounded-lg transition-colors"
                  onClick={() => router.push("/rooms")}
                >
                  Book Another Stay
                </Button>

                <Button
                  variant="outline"
                  className="w-full font-medium py-3 md:py-4 text-base md:text-lg rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
                  onClick={() => router.push("/")}
                >
                  Back to Home
                </Button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
