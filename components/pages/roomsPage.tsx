"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, Maximize, Wifi, Wind, Tv, Coffee, Clock, Maximize2 } from "lucide-react";
import { rooms } from "@/data/rooms";

export function RoomsClient() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
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
            {rooms.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white">
                <div className="flex flex-col md:flex-row h-full">
                  {/* Image - 40% */}
                  <div className="w-full md:w-[40%] h-[280px] md:h-auto overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Content - 60% */}
                  <div className="w-full md:w-[60%] p-6 flex flex-col relative">
                    {/* Guest Badge - Top Right */}
                    <Badge className="absolute top-4 right-4 bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
                      {room.maxGuests} Guests
                    </Badge>

                    {/* Room Type */}
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 pr-24">{room.name}</h3>
                    
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
                        <Link href={`/rooms/${room.slug}`} className="flex-1">
                          <Button 
                            variant="outline" 
                            className="w-full bg-white border-amber-600  text-amber-600  hover:bg-gray-50"
                          >
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/book-now?room=${encodeURIComponent(room.name)}`} className="flex-1">
                          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Wifi className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-700">Free WiFi</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Wind className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-700">Air Conditioning</p>
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
                <Clock className="w-10 h-10 text-amber-600" />
              </div>
              <p className="text-center text-sm font-medium text-gray-700">24/7 Room Service</p>
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
