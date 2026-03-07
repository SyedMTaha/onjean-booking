"use client";

import { useMemo, useState } from "react";

type GalleryCategory = "All" | "Rooms" | "Facilities" | "Spa" | "Dining";

const filters: GalleryCategory[] = ["All", "Rooms", "Facilities", "Spa", "Dining"];

const galleryImages: Array<{ title: string; category: Exclude<GalleryCategory, "All">; image: string }> = [
  { title: "Deluxe Bedroom", category: "Rooms", image: "/gallery/image-1.jpeg" },
  { title: "Executive Suite", category: "Rooms", image: "/gallery/image-2.jpeg" },
  { title: "King Room", category: "Rooms", image: "/gallery/image-3.jpeg" },
  { title: "Luxury Suite", category: "Rooms", image: "/gallery/image-4.jpeg" },
  { title: "Premium Room", category: "Rooms", image: "/gallery/image-5.jpeg" },
  { title: "Elegant Bedroom", category: "Rooms", image: "/gallery/image-6.jpeg" },
  { title: "Modern Room", category: "Rooms", image: "/gallery/image-7.jpeg" },
  { title: "Comfort Suite", category: "Rooms", image: "/gallery/image-8.jpeg" },
  { title: "Spacious Room", category: "Rooms", image: "/gallery/image-9.jpeg" },
  { title: "Master Suite", category: "Rooms", image: "/gallery/image-10.jpeg" },
  { title: "Pool Lounge", category: "Facilities", image: "https://images.unsplash.com/photo-1601584942745-8880755f5880?w=1200&h=800&fit=crop" },
  { title: "Conference Hall", category: "Facilities", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop" },
  { title: "Fitness Studio", category: "Facilities", image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&h=800&fit=crop" },
  { title: "Outdoor Terrace", category: "Facilities", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop" },
  { title: "Main Lobby", category: "Facilities", image: "https://images.unsplash.com/photo-1592383809697-4986ac3151c6?w=1200&h=800&fit=crop" },
  { title: "Spa Treatment Room", category: "Spa", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=800&fit=crop" },
  { title: "Wellness Retreat", category: "Spa", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop" },
  { title: "Massage Therapy", category: "Spa", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1200&h=800&fit=crop" },
  { title: "Spa Lounge", category: "Spa", image: "https://images.unsplash.com/photo-1552693673-1bf958298935?w=1200&h=800&fit=crop" },
  { title: "Signature Dining", category: "Dining", image: "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1200&h=800&fit=crop" },
  { title: "Chef's Special", category: "Dining", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=800&fit=crop" },
  { title: "Fine Dining Room", category: "Dining", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop" },
  { title: "Breakfast Buffet", category: "Dining", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=800&fit=crop" },
];

export function GalleryClient() {
  const [activeFilter, setActiveFilter] = useState<GalleryCategory>("All");

  const filteredImages = useMemo(() => {
    if (activeFilter === "All") return galleryImages;
    return galleryImages.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <section className="relative h-[300px] md:h-[400px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600&h=700&fit=crop"
            alt="Our Gallery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3">Photo Gallery</h1>
          <p className="text-lg md:text-xl text-gray-100">Explore our beautiful hotel through these stunning images</p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`min-w-[90px] md:min-w-[130px] py-2 md:py-2.5 px-4 rounded-full text-lg font-medium transition-colors whitespace-nowrap ${
                    activeFilter === filter
                      ? "bg-amber-600 text-white"
                      : "bg-gray-100 text-slate-700 hover:bg-gray-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((item, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
