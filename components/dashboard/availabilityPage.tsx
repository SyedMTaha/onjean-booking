"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getAllBookings } from "@/lib/bookingService";
import { getAllRooms } from "@/lib/roomService";

interface DayAvailability {
  date: number;
  available: number;
  occupied: number;
  reserved: number;
}

interface RoomTypeStats {
  name: string;
  total: number;
  available: number;
  occupied: number;
  reserved: number;
}

interface BookingLike {
  roomType?: string;
  bookingStatus?: "pending" | "approved" | "rejected" | "cancelled";
  checkInDate?: any;
  checkOutDate?: any;
}

function normalizeDate(value: any): Date | null {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function atStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isDateWithinStay(day: Date, checkIn: Date, checkOut: Date): boolean {
  const d = atStartOfDay(day).getTime();
  const start = atStartOfDay(checkIn).getTime();
  const end = atStartOfDay(checkOut).getTime();
  return d >= start && d < end;
}

export function AvailabilityManagementClient() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [bookings, setBookings] = useState<BookingLike[]>([]);
  const [rooms, setRooms] = useState<Array<{ id: string; name: string; available: boolean }>>([]);

  useEffect(() => {
    const hasSession = localStorage.getItem("dashboardAdminSession") === "true";

    if (!hasSession) {
      toast.error("Please sign in with admin credentials to access availability.");
      router.push("/");
      setIsAuthLoading(false);
      return;
    }

    setIsAdminAuthenticated(true);
    setIsAuthLoading(false);
  }, [router]);

  useEffect(() => {
    const loadAvailabilityData = async () => {
      if (!isAdminAuthenticated) return;
      setIsDataLoading(true);
      try {
        const [allBookings, allRooms] = await Promise.all([
          getAllBookings(),
          getAllRooms()
        ]);
        setBookings(allBookings as BookingLike[]);
        setRooms(allRooms.filter(room => room.available));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load availability data.");
      } finally {
        setIsDataLoading(false);
      }
    };

    loadAvailabilityData();
  }, [isAdminAuthenticated]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayOfMonth = currentMonth.getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const roomInventoryByType = useMemo(() => {
    const inventory = new Map<string, number>();
    rooms.forEach((room) => {
      inventory.set(room.name, (inventory.get(room.name) || 0) + 1);
    });
    return inventory;
  }, [rooms]);

  const totalRooms = useMemo(
    () => Array.from(roomInventoryByType.values()).reduce((sum, count) => sum + count, 0),
    [roomInventoryByType]
  );

  const getDayAvailability = (dayDate: Date) => {
    let occupied = 0;
    let reserved = 0;

    bookings.forEach((booking) => {
      const checkIn = normalizeDate(booking.checkInDate);
      const checkOut = normalizeDate(booking.checkOutDate);
      if (!checkIn || !checkOut) return;
      if (!isDateWithinStay(dayDate, checkIn, checkOut)) return;

      if (booking.bookingStatus === "approved") {
        occupied += 1;
      } else if (booking.bookingStatus === "pending") {
        reserved += 1;
      }
    });

    const unavailable = Math.min(totalRooms, occupied + reserved);
    const available = Math.max(totalRooms - unavailable, 0);

    return { available, occupied, reserved };
  };

  const calendarDays: DayAvailability[] = useMemo(() => {
    return Array.from({ length: daysInMonth }).map((_, idx) => {
      const date = idx + 1;
      const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date);
      const stats = getDayAvailability(dayDate);
      return {
        date,
        ...stats,
      };
    });
  }, [daysInMonth, currentMonth, bookings, totalRooms]);

  const roomTypes: RoomTypeStats[] = useMemo(() => {
    const today = new Date();
    const statsByType = new Map<string, { occupied: number; reserved: number }>();

    bookings.forEach((booking) => {
      const roomType = booking.roomType || "Unknown Room";
      const checkIn = normalizeDate(booking.checkInDate);
      const checkOut = normalizeDate(booking.checkOutDate);
      if (!checkIn || !checkOut) return;
      if (!isDateWithinStay(today, checkIn, checkOut)) return;

      // Only count bookings for room types that exist in current inventory
      if (!roomInventoryByType.has(roomType)) return;

      const existing = statsByType.get(roomType) || { occupied: 0, reserved: 0 };

      if (booking.bookingStatus === "approved") {
        existing.occupied += 1;
      } else if (booking.bookingStatus === "pending") {
        existing.reserved += 1;
      }

      statsByType.set(roomType, existing);
    });

    // Only show room types that exist in current inventory
    return Array.from(roomInventoryByType.keys()).map((name) => {
      const total = roomInventoryByType.get(name) || 0;
      const occupied = statsByType.get(name)?.occupied || 0;
      const reserved = statsByType.get(name)?.reserved || 0;
      const available = Math.max(total - Math.min(total, occupied + reserved), 0);

      return {
        name,
        total,
        available,
        occupied,
        reserved,
      };
    });
  }, [bookings, roomInventoryByType]);

  const totalStats = useMemo(() => {
    const monthSnapshotDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return getDayAvailability(monthSnapshotDate);
  }, [currentMonth, bookings, totalRooms]);

  const grandTotal = totalStats.available + totalStats.occupied + totalStats.reserved;
  const availablePercent = grandTotal > 0 ? ((totalStats.available / grandTotal) * 100).toFixed(1) : "0.0";
  const occupiedPercent = grandTotal > 0 ? ((totalStats.occupied / grandTotal) * 100).toFixed(1) : "0.0";
  const reservedPercent = grandTotal > 0 ? ((totalStats.reserved / grandTotal) * 100).toFixed(1) : "0.0";

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
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
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Room Availability</h1>
          <p className="text-gray-600 mt-1">Overview of room availability and occupancy calendar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-[#00BC7D] shrink-0"></div>
              <div>
                <p className="text-sm text-gray-600">Available Rooms</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{totalStats.available}</p>
                <p className="text-sm font-medium text-[#007A55] mt-2">{availablePercent}% capacity</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-[#E91E63] shrink-0"></div>
              <div>
                <p className="text-sm text-gray-600">Occupied Rooms</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{totalStats.occupied}</p>
                <p className="text-sm font-medium text-[#E91E63] mt-2">{occupiedPercent}% capacity</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-[#FF9800] shrink-0"></div>
              <div>
                <p className="text-sm text-gray-600">Reserved Rooms</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{totalStats.reserved}</p>
                <p className="text-sm font-medium text-[#FF9800] mt-2">{reservedPercent}% capacity</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <Card className="lg:col-span-2 p-6 bg-white border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()} Availability
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square"></div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((dayData, idx) => {
                  return (
                    <div
                      key={idx}
                      className="aspect-square border border-gray-200 rounded-lg p-2 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="text-lg font-semibold text-gray-900 mb-1">{dayData.date}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-[#00BC7D]"></div>
                          <span className="text-gray-700">{dayData.available}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-[#E91E63]"></div>
                          <span className="text-gray-700">{dayData.occupied}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-[#FF9800]"></div>
                          <span className="text-gray-700">{dayData.reserved}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#00BC7D]"></div>
                  <span className="text-sm text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#E91E63]"></div>
                  <span className="text-sm text-gray-700">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FF9800]"></div>
                  <span className="text-sm text-gray-700">Reserved</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Room Type Availability Section */}
          <Card className="p-6 bg-white border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Room Type Availability</h2>
            <div className="space-y-6">
              {isDataLoading ? (
                <p className="text-sm text-gray-500">Loading room availability...</p>
              ) : roomTypes.length === 0 ? (
                <p className="text-sm text-gray-500">No room type data available yet.</p>
              ) : (
                roomTypes.map((roomType) => {
                  const availablePercent = roomType.total > 0 ? (roomType.available / roomType.total) * 100 : 0;
                  const occupiedPercent = roomType.total > 0 ? (roomType.occupied / roomType.total) * 100 : 0;
                  const reservedPercent = roomType.total > 0 ? (roomType.reserved / roomType.total) * 100 : 0;

                  return (
                    <div key={roomType.name} className="space-y-3">
                      <h3 className="font-semibold text-gray-900">{roomType.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total</span>
                          <span className="font-medium text-gray-900">{roomType.total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#00BC7D]"></div>
                            <span className="text-gray-600">Available</span>
                          </div>
                          <span className="font-medium text-gray-900">{roomType.available}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#E91E63]"></div>
                            <span className="text-gray-600">Occupied</span>
                          </div>
                          <span className="font-medium text-gray-900">{roomType.occupied}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#FF9800]"></div>
                            <span className="text-gray-600">Reserved</span>
                          </div>
                          <span className="font-medium text-gray-900">{roomType.reserved}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex mt-3">
                          <div
                            className="h-full bg-[#00BC7D]"
                            style={{ width: `${availablePercent}%` }}
                          ></div>
                          <div
                            className="h-full bg-[#E91E63]"
                            style={{ width: `${occupiedPercent}%` }}
                          ></div>
                          <div
                            className="h-full bg-[#FF9800]"
                            style={{ width: `${reservedPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
