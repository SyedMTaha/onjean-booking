import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Luxury Rooms - 78 On Jean",
  description: "Explore our collection of beautifully designed luxury rooms and suites.",
};

const rooms = [
  {
    id: 1,
    name: "Standard Room",
    price: "R1,200",
    image: "https://images.unsplash.com/photo-1766928210443-0be92ed5884a?w=500&h=400&fit=crop",
    features: ["King Bed", "City View", "25 m²", "Free WiFi", "Air Conditioning"],
    description: "Perfect for the budget-conscious traveler. Comfortable and well-equipped."
  },
  {
    id: 2,
    name: "Deluxe Room",
    price: "R1,800",
    image: "https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=500&h=400&fit=crop",
    features: ["King Bed", "Ocean View", "35 m²", "Luxury Amenities", "Premium Bedding"],
    description: "Upgraded comfort with stunning views. Ideal for couples."
  },
  {
    id: 3,
    name: "Family Suite",
    price: "R2,500",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop",
    features: ["Multiple Beds", "Living Area", "60 m²", "Full Kitchen", "Family Bathroom"],
    description: "Spacious suite perfect for families with all the comforts of home."
  },
  {
    id: 4,
    name: "Executive Suite",
    price: "R3,200",
    image: "https://images.unsplash.com/photo-1648416405644-d74fe43f2122?w=500&h=400&fit=crop",
    features: ["King Bed", "Workspace", "45 m²", "Mini Bar", "Premium Service"],
    description: "Business and leisure combined. Perfect for the modern executive."
  },
  {
    id: 5,
    name: "Honeymoon Suite",
    price: "R3,800",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=400&fit=crop",
    features: ["Luxury Bed", "Jacuzzi", "50 m²", "Romantic Decor", "Champagne"],
    description: "Create unforgettable memories in our romantic honeymoon suite."
  },
  {
    id: 6,
    name: "Presidential Suite",
    price: "R5,000",
    image: "https://images.unsplash.com/photo-1664780476492-fbb9fd277ce8?w=500&h=400&fit=crop",
    features: ["Luxury Beds", "Panoramic View", "100 m²", "Full Service", "Concierge"],
    description: "Ultimate luxury experience. The crown jewel of our hotel."
  },
];

export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=400&fit=crop"
            alt="Luxury Rooms"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 to-amber-800/80" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4">Luxury Accommodations</h1>
            <p className="text-xl text-amber-50">Discover our exquisite collection of rooms and suites</p>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0">
                <div className="h-64 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{room.name}</h3>
                  <p className="text-gray-600 mb-4">{room.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.features.slice(0, 3).map((feature, i) => (
                      <span key={i} className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <span className="text-3xl font-bold text-amber-600">{room.price}</span>
                      <span className="text-gray-500 text-sm ml-2">/ night</span>
                    </div>
                    <Link href="/booking">
                      <Button className="bg-amber-600 hover:bg-amber-700">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
