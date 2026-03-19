"use client";

// ── Types ──────────────────────────────────────────────────────────────────────
interface DateRange {
  from: string;
  to: string;
}

interface AvailabilitySchedule {
  dateRanges: DateRange[];
  daysOfWeek: string[];
}

// ── Availability helpers ───────────────────────────────────────────────────────
function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getNextAvailableDate(availability: AvailabilitySchedule) {
  if (!availability) return null;
  const today = new Date();
  let soonest: Date | null = null;

  for (const range of availability.dateRanges || []) {
    const from = new Date(range.from);
    const to = new Date(range.to);
    if (today < from) {
      if (!soonest || from < soonest) soonest = from;
    } else if (today >= from && today <= to) {
      soonest = today;
      break;
    }
  }

  if (soonest && soonest > today) return soonest;

  if ((availability.daysOfWeek || []).length > 0) {
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = weekDays[today.getDay()];
    if (availability.daysOfWeek.includes(todayName)) return today;

    for (let i = 1; i <= 7; i++) {
      const next = new Date(today);
      next.setDate(today.getDate() + i);
      const nextName = weekDays[next.getDay()];
      if (availability.daysOfWeek.includes(nextName)) {
        if (!soonest || next < soonest) soonest = next;
        break;
      }
    }
  }

  return soonest;
}

// ── Imports ────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, Maximize, Wifi, Tv, Coffee, Maximize2 } from "lucide-react";
import { getAllRooms, Room as BaseRoom } from "@/lib/roomService";

// ── Extended Room type with availability ───────────────────────────────────────
interface Room extends BaseRoom {
  availability?: AvailabilitySchedule;
}

interface RoomsClientProps {
  locale: string;
}

// ── Empty availability fallback ────────────────────────────────────────────────
const EMPTY_AVAILABILITY: AvailabilitySchedule = { dateRanges: [], daysOfWeek: [] };

export default function RoomsClient({ locale }: RoomsClientProps) {
  const t = useTranslations();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      try {
        const dbRooms = await getAllRooms();
        // ✅ Fix line 86: cast to any so TS doesn't complain about BaseRoom
        // missing availability — we provide a fallback for rooms that don't have it
        setRooms(
          dbRooms.map((room: any) => ({
            ...room,
            availability: (room.availability as AvailabilitySchedule) ?? EMPTY_AVAILABILITY,
          }))
        );
      } catch {
        setRooms([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* Hero Section */}
      <section className="relative h-75 md:h-100 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=500&fit=crop"
            alt="Luxury Rooms"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-4xl md:text-5xl font-semibold mb-4">
              {t("roomsPage.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-amber-50">
              {t("roomsPage.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {loading ? (
              Array.from({ length: 7 }).map((_, index) => (
                <Card
                  key={index}
                  className="overflow-hidden border border-gray-200 bg-white animate-pulse"
                >
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="w-full md:w-[40%] h-70 md:h-auto bg-gray-300" />
                    <div className="w-full md:w-[60%] p-6 flex flex-col">
                      <div className="h-6 bg-gray-300 rounded mb-3 w-3/4" />
                      <div className="h-4 bg-gray-200 rounded mb-3 w-1/2" />
                      <div className="h-4 bg-gray-200 rounded mb-2 w-full" />
                      <div className="h-4 bg-gray-200 rounded mb-4 w-full" />
                      <div className="flex gap-2 mb-5">
                        <div className="h-6 w-16 bg-gray-200 rounded" />
                        <div className="h-6 w-20 bg-gray-200 rounded" />
                      </div>
                      <div className="mt-auto pt-4 border-t">
                        <div className="h-8 bg-gray-300 rounded mb-4 w-1/3" />
                        <div className="flex gap-3">
                          <div className="h-10 bg-gray-200 rounded flex-1" />
                          <div className="h-10 bg-gray-300 rounded flex-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : rooms.length > 0 ? (
              rooms.map((room) => {
                // ✅ Fix lines 172 & 181: always provide fallback so avail is never undefined
                const avail: AvailabilitySchedule =
                  room.availability ?? EMPTY_AVAILABILITY;
                const nextAvail = getNextAvailableDate(avail);
                const isAvailableNow = nextAvail !== null && nextAvail <= new Date();

                const availBadgeClass = isAvailableNow
                  ? "bg-green-100 text-green-700 border-0"
                  : "bg-red-100 text-red-700 border-0";

                const availLabel = isAvailableNow
                  ? t("roomsPage.available")
                  : nextAvail instanceof Date
                  ? `Available in ${Math.ceil(
                      (nextAvail.getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} days`
                  : t("roomsPage.unavailable");

                return (
                  <Card
                    key={room.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white"
                  >
                    <div className="flex flex-col md:flex-row h-full">
                      {/* Image — 40% */}
                      <div className="w-full md:w-[40%] h-70 md:h-auto overflow-hidden">
                        <img
                          src={room.image}
                          alt={room.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                      </div>

                      {/* Content — 60% */}
                      <div className="w-full md:w-[60%] p-6 pt-12 flex flex-col relative">
                        {/* Room ID Badge — top left */}
                        <Badge className="absolute top-4 left-4 bg-blue-100 text-blue-700 border-0">
                          {t("roomsPage.roomId")}: {room.id}
                        </Badge>

                        {/* Guest + Availability badges — top right */}
                        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
                            {room.maxGuests} {t("roomsPage.guests")}
                          </Badge>
                          <Badge className={availBadgeClass}>
                            {availLabel}
                          </Badge>
                        </div>

                        {/* Room name */}
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 pr-24 mt-4">
                          {room.name}
                        </h3>

                        {/* Bed type */}
                        <p className="text-sm text-gray-600 mb-3">{room.bedType}</p>

                        {/* Description */}
                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                          {room.description}
                        </p>

                        {/* Guests + size */}
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>
                              {room.maxGuests} {t("roomsPage.guests")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Maximize className="w-4 h-4" />
                            <span>{room.size}</span>
                          </div>
                        </div>

                        {/* Amenity badges */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {room.amenities.slice(0, 5).map((amenity, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs text-gray-700 bg-white border-gray-300"
                            >
                              {amenity}
                            </Badge>
                          ))}
                        </div>

                        {/* Price + Buttons */}
                        <div className="mt-auto pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <span className="text-3xl font-bold text-amber-600">
                                {room.price}
                              </span>
                              <span className="text-gray-500 text-sm ml-2">
                                {t("roomsPage.perNight")}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Link
                              href={`/${locale}/rooms/${room.slug}`}
                              className="flex-1"
                            >
                              <Button
                                variant="outline"
                                className="w-full bg-white border-amber-600 text-amber-600 hover:bg-gray-50"
                              >
                                {t("roomsPage.viewDetails")}
                              </Button>
                            </Link>
                            <Link
                              href={`/book-now?roomId=${encodeURIComponent(room.id)}&room=${encodeURIComponent(room.name)}`}
                              className="flex-1"
                            >
                              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                                {t("roomsPage.bookNow")}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-500 text-lg">{t("roomsPage.noRooms")}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Standard Amenities Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t("roomsPage.amenitiesTitle")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("roomsPage.amenitiesSubtitle")}
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Wifi className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-700">
                {t("roomsPage.amenities.wifi")}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Tv className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-700">
                {t("roomsPage.amenities.tv")}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Coffee className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-700">
                {t("roomsPage.amenities.coffee")}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Maximize2 className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-700">
                {t("roomsPage.amenities.spacious")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}