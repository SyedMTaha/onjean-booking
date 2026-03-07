"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BedDouble, DoorOpen, Plus, Search, Wrench } from "lucide-react";
import { toast } from "sonner";

type RoomStatus = "available" | "reserved" | "occupied" | "maintenance";

interface Room {
  id: string;
  roomNumber: string;
  roomName: string;
  floor: number;
  bedType: string;
  ratePerNight: number;
  status: RoomStatus;
}

// Mock data - replace with actual Firestore fetch later
const mockRooms: Room[] = [
  {
    id: "1",
    roomNumber: "101",
    roomName: "Deluxe Suite",
    floor: 1,
    bedType: "1 King",
    ratePerNight: 2500,
    status: "available",
  },
  {
    id: "2",
    roomNumber: "102",
    roomName: "Standard Room",
    floor: 1,
    bedType: "2 Queen",
    ratePerNight: 1800,
    status: "occupied",
  },
  {
    id: "3",
    roomNumber: "201",
    roomName: "Executive Suite",
    floor: 2,
    bedType: "1 King",
    ratePerNight: 3500,
    status: "reserved",
  },
  {
    id: "4",
    roomNumber: "202",
    roomName: "Family Room",
    floor: 2,
    bedType: "2 Queen",
    ratePerNight: 2200,
    status: "available",
  },
  {
    id: "5",
    roomNumber: "301",
    roomName: "Penthouse",
    floor: 3,
    bedType: "1 King",
    ratePerNight: 5000,
    status: "maintenance",
  },
];

function getFloorLabel(floor: number): string {
  if (floor === 1) return "1st";
  if (floor === 2) return "2nd";
  if (floor === 3) return "3rd";
  return `${floor}th`;
}

function getStatusBadgeClass(status: RoomStatus): string {
  switch (status) {
    case "available":
      return "bg-[#007A55]/10 text-[#007A55] border-[#007A55]/30";
    case "reserved":
      return "bg-[#1447E6]/10 text-[#1447E6] border-[#1447E6]/30";
    case "occupied":
      return "bg-[#8200DB]/10 text-[#8200DB] border-[#8200DB]/30";
    case "maintenance":
      return "bg-amber-100 text-amber-700 border-amber-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}

export function RoomsManagementClient() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const hasSession = localStorage.getItem("dashboardAdminSession") === "true";

    if (!hasSession) {
      toast.error("Please sign in with admin credentials to access rooms.");
      router.push("/");
      setIsAuthLoading(false);
      return;
    }

    setIsAdminAuthenticated(true);
    setIsAuthLoading(false);
  }, [router]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      // Simulate loading
      setTimeout(() => {
        setRooms(mockRooms);
        setIsLoading(false);
      }, 500);
    }
  }, [isAdminAuthenticated]);

  const filteredRooms = rooms.filter((room) => {
    const needle = search.trim().toLowerCase();
    if (needle.length === 0) return true;

    return (
      room.roomNumber.toLowerCase().includes(needle) ||
      room.roomName.toLowerCase().includes(needle) ||
      room.bedType.toLowerCase().includes(needle) ||
      getFloorLabel(room.floor).toLowerCase().includes(needle)
    );
  });

  const totals = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    reserved: rooms.filter((r) => r.status === "reserved").length,
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
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600 mt-1">Manage hotel rooms and their availability</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by room number, name, or type"
              className="h-10 pl-10 placeholder:text-gray-400 text-gray-900 border-gray-300 bg-white rounded-xl"
            />
          </div>

          <Button className="h-10 bg-[#2B7FFF] hover:bg-[#1f5dcc] text-white rounded-xl lg:ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Room
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.available}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <DoorOpen className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.occupied}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <BedDouble className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Reserved</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.reserved}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <BedDouble className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.total}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <DoorOpen className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-gray-500">Loading rooms...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">No rooms found.</div>
          ) : (
            filteredRooms.map((room) => (
              <Card
                key={room.id}
                className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 relative"
              >
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className={`${getStatusBadgeClass(room.status)} capitalize text-xs`}>
                    {room.status}
                  </Badge>
                </div>

                <div className="space-y-3 mt-6">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">#{room.roomNumber}</p>
                    <p className="text-sm text-gray-600 mt-1">{room.roomName}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Floor:</span>
                      <span className="font-medium text-gray-900">{getFloorLabel(room.floor)} Floor</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Bed Type:</span>
                      <span className="font-medium text-gray-900">{room.bedType}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Rate:</span>
                      <span className="text-lg font-bold text-gray-900">R{room.ratePerNight.toLocaleString()}/night</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
