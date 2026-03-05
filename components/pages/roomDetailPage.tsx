"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Maximize, Bed, Eye, Check, Wifi, Trees, Bath, Wine, Tv } from "lucide-react";
import { Room, rooms } from "@/data/rooms";
import { useState, useMemo } from "react";

interface RoomDetailClientProps {
  room: Room;
}

// Function to get random different rooms (excluding current room)
function getRandomRooms(currentRoomId: number, count: number): Room[] {
  const otherRooms = rooms.filter(r => r.id !== currentRoomId);
  const shuffled = [...otherRooms].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface RoomDetailClientProps {
  room: Room;
}

export function RoomDetailClient({ room }: RoomDetailClientProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(room.images?.[0] || room.image);
  const randomRooms = useMemo(() => getRandomRooms(room.id, 4), [room.id]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={selectedImage}
            alt={room.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-between py-8">
          {/* Back Button */}
          <div>
            <Button
              onClick={() => router.push("/rooms")}
              variant="outline"
              className="bg-white/90 hover:bg-white border-0 text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rooms
            </Button>
          </div>

          {/* Room Title */}
          <div className="text-white">
            <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
              {room.maxGuests} Guests
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{room.name}</h1>
            <p className="text-xl md:text-2xl text-amber-50">{room.view}</p>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      {room.images && room.images.length > 1 && (
        <section className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex gap-4 overflow-x-auto">
              {room.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`flex-shrink-0 w-68 h-32 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === image ? "border-amber-600" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${room.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-white border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Guests</p>
                      <p className="text-lg font-semibold text-gray-900">{room.maxGuests}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-white border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Maximize className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Size</p>
                      <p className="text-lg font-semibold text-gray-900">{room.size}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-white border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Bed className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bed</p>
                      <p className="text-sm font-semibold text-gray-900">{room.bedType}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-white border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">View</p>
                      <p className="text-sm font-semibold text-gray-900">{room.view}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Description */}
              <Card className="p-8 bg-white border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Room</h2>
                <p className="text-gray-700 leading-relaxed mb-4">{room.longDescription || room.description}</p>
              </Card>

              {/* Amenities */}
              <Card className="p-8 bg-white border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {/* WiFi */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2 md:px-5 md:py-3 border border-gray-200">
                    <Wifi className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">WiFi</span>
                  </div>

                  {/* Garden View */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2 md:px-5 md:py-3 border border-gray-200">
                    <Trees className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">Garden View</span>
                  </div>

                  {/* Private Bathroom */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2 md:px-5 md:py-3 border border-gray-200">
                    <Bath className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">Private Bathroom</span>
                  </div>

                  {/* Minibar */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2 md:px-5 md:py-3 border border-gray-200">
                    <Wine className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">Minibar</span>
                  </div>

                  {/* Flat-screen TV */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2 md:px-5 md:py-3 border border-gray-200">
                    <Tv className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">Flat-screen TV</span>
                  </div>

                  {/* Optional: Add more amenities if needed */}
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2 md:px-5 md:py-3 border border-gray-200">
                    <Check className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">24/7 Room Service</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-white border-gray-200 sticky top-20">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-amber-600">{room.price}</span>
                    <span className="text-gray-500">/ night</span>
                  </div>
                  <p className="text-sm text-gray-600">Best available rate</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Maximum Guests:</span>
                    <span className="font-medium text-gray-900">{room.maxGuests} Guests</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Room Size:</span>
                    <span className="font-medium text-gray-900">{room.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bed Type:</span>
                    <span className="font-medium text-gray-900">{room.bedType}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-3">
                  <Link href="/booking" className="block">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                      Book Now
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => router.push("/contact")}
                  >
                    Contact for Inquiry
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-800 text-center">
                    <strong>Free cancellation</strong> up to 48 hours before check-in
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* You May Also Like Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">You May Also Like</h2>
            <p className="text-gray-600 text-lg">Similar rooms that might interest you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {randomRooms.map((similarRoom) => (
              <Card key={similarRoom.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white flex flex-col">
                {/* Image - 50% */}
                <div className="w-full h-40 overflow-hidden">
                  <img
                    src={similarRoom.image}
                    alt={similarRoom.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Content - 50% */}
                <div className="flex-1 p-5 flex flex-col">
                  {/* Room Title */}
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">{similarRoom.name}</h3>

                  {/* Guest & Size Info */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{similarRoom.maxGuests} Guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Maximize className="w-4 h-4" />
                      <span>{similarRoom.size}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-amber-600">{similarRoom.price}</span>
                    <span className="text-gray-500 text-sm ml-1">/ night</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <Link href={`/rooms/${similarRoom.slug}`} className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                      >
                        View
                      </Button>
                    </Link>
                    <Link href="/booking" className="flex-1">
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm">
                        Book
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Policies Section */}
      {/* <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Policies & Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Check-in / Check-out</h3>
              <p className="text-sm text-gray-600 mb-2">Check-in: 3:00 PM</p>
              <p className="text-sm text-gray-600">Check-out: 11:00 AM</p>
            </Card>

            <Card className="p-6 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation</h3>
              <p className="text-sm text-gray-600">
                Free cancellation up to 48 hours before arrival. Late cancellations subject to one night's charge.
              </p>
            </Card>

            <Card className="p-6 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Info</h3>
              <p className="text-sm text-gray-600 mb-2">Non-smoking room</p>
              <p className="text-sm text-gray-600">Pets not allowed</p>
            </Card>
          </div>
        </div>
      </section> */}
    </div>
  );
}
