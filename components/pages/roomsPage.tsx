"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, Maximize, Wifi, Wind, Tv, Coffee, Clock, Maximize2 } from "lucide-react";
import { getAllRooms, Room } from "@/lib/roomService";
import { rooms as fallbackRooms } from "@/data/rooms";
import { useEffect, useState } from "react";

interface RoomsClientProps {
  locale: string;
}

export default function RoomsClient({ locale }: RoomsClientProps) {
  // Use local rooms data directly
  const mappedRooms = fallbackRooms.map(r => ({
    ...r,
    priceNumeric: parseInt(r.price.replace(/[R,]/g, ""), 10),
    available: true
  })) as Room[];
  const rooms = mappedRooms;
  const loading = false;

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
            <h1 className="text-4xl md:text-5xl font-semibold mb-4">Our Rooms & Suites</h1>
            <p className="text-lg md:text-xl text-amber-50">Choose from our carefully designed accommodations, each offering comfort and luxury</p>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 7 }).map((_, index) => (
                <Card key={index} className="overflow-hidden border border-gray-200 bg-white animate-pulse">
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
              rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white">
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Image - 40% */}
                    <div className="w-full md:w-[40%] h-70 md:h-auto overflow-hidden">
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    {/* Content - 60% */}
                    <div className="w-full md:w-[60%] p-6 pt-12 flex flex-col relative">
                      {/* Room ID Badge - Top Left */}
                      <Badge className="absolute top-4 left-4 bg-blue-100 text-blue-700 border-0">
                        Room ID: {room.id}
                      </Badge>
                      {/* Guest Badge - Top Right */}
                      <Badge className="absolute top-4 right-4 bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
                        {room.maxGuests} Guests
                      </Badge>
                      {/* Room Type */}
                      <h3 className="text-2xl font-bold text-slate-900 mb-2 pr-24 mt-4">{room.name}</h3>
                      {/* Bed Type */}
                      <p className="text-sm text-gray-600 mb-3">{room.bedType}</p>
                      {/* Description */}
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{room.description}</p>
                      {/* Guest & Size Info */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{room.maxGuests} Guests</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Maximize className="w-4 h-4" />
                          <span>{room.size}</span>
                        </div>
                      </div>
                      {/* Amenities Badges */}
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
                      {/* Price & Buttons */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-3xl font-bold text-amber-600">{room.price}</span>
                            <span className="text-gray-500 text-sm ml-2">/ night</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Link href={`/${locale}/rooms/${room.slug}`} className="flex-1">
                            <Button 
                              variant="outline" 
                              className="w-full bg-white border-amber-600  text-amber-600  hover:bg-gray-50"
                            >
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/book-now?roomId=${encodeURIComponent(room.id)}&room=${encodeURIComponent(room.name)}`} className="flex-1">
                            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                              Book Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-500 text-lg">No rooms available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Standard Amenities Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">All Rooms Include</h2>
            <p className="text-gray-600 text-lg">Standard amenities in every room</p>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Wifi className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-700">Free WiFi</p>
            </div>
            
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Tv className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-700">Flat Screen TV</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Coffee className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-700">Coffee Maker</p>
            </div>

            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Maximize2 className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-700">Spacious Rooms</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
