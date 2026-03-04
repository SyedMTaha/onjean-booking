"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, Maximize, Wifi, Wind, Tv, Coffee, Clock, Maximize2 } from "lucide-react";

const rooms = [
  {
    id: 1,
    name: "Standard Room",
    slug: "standard-room",
    price: "R1,200",
    image: "https://images.unsplash.com/photo-1766928210443-0be92ed5884a?w=600&h=500&fit=crop",
    maxGuests: 2,
    bedType: "1 King Bed",
    size: "25 m²",
    description: "Perfect for the budget-conscious traveler. Comfortable and well-equipped with modern amenities.",
    amenities: ["WiFi", "AC", "TV", "Mini Bar", "Safe"]
  },
  {
    id: 2,
    name: "Deluxe Room",
    slug: "deluxe-room",
    price: "R1,800",
    image: "https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=600&h=500&fit=crop",
    maxGuests: 2,
    bedType: "1 King Bed",
    size: "35 m²",
    description: "Upgraded comfort with stunning views. Ideal for couples seeking a luxurious experience.",
    amenities: ["WiFi", "AC", "TV", "Mini Bar", "Safe", "Bathtub"]
  },
  {
    id: 3,
    name: "Family Suite",
    slug: "family-suite",
    price: "R2,500",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=500&fit=crop",
    maxGuests: 4,
    bedType: "2 Queen Beds",
    size: "60 m²",
    description: "Spacious suite perfect for families with all the comforts of home and separate living area.",
    amenities: ["WiFi", "AC", "TV", "Kitchen", "Safe", "Washer"]
  },
  {
    id: 4,
    name: "Executive Suite",
    slug: "executive-suite",
    price: "R3,200",
    image: "https://images.unsplash.com/photo-1648416405644-d74fe43f2122?w=600&h=500&fit=crop",
    maxGuests: 2,
    bedType: "1 King Bed",
    size: "45 m²",
    description: "Business and leisure combined. Perfect for the modern executive with dedicated workspace.",
    amenities: ["WiFi", "AC", "TV", "Mini Bar", "Safe", "Workspace"]
  },
  {
    id: 5,
    name: "Honeymoon Suite",
    slug: "honeymoon-suite",
    price: "R3,800",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=500&fit=crop",
    maxGuests: 2,
    bedType: "1 King Luxury Bed",
    size: "50 m²",
    description: "Create unforgettable memories in our romantic honeymoon suite with private jacuzzi.",
    amenities: ["WiFi", "AC", "TV", "Jacuzzi", "Mini Bar", "Safe"]
  },
  {
    id: 6,
    name: "Presidential Suite",
    slug: "presidential-suite",
    price: "R5,000",
    image: "https://images.unsplash.com/photo-1664780476492-fbb9fd277ce8?w=600&h=500&fit=crop",
    maxGuests: 4,
    bedType: "2 King Beds",
    size: "100 m²",
    description: "Ultimate luxury experience. The crown jewel of our hotel with panoramic views and concierge service.",
    amenities: ["WiFi", "AC", "TV", "Kitchen", "Jacuzzi", "Concierge"]
  },
];

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
                        <Link href="/booking" className="flex-1">
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
