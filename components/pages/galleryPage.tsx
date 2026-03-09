"use client";

const roomImages: Array<{ title: string; image: string }> = [
  { title: "Deluxe Bedroom", image: "/gallery/image-1.jpeg" },
  { title: "Executive Suite", image: "/gallery/image-2.jpeg" },
  { title: "King Room", image: "/gallery/image-3.jpeg" },
  { title: "Luxury Suite", image: "/gallery/image-4.jpeg" },
  { title: "Premium Room", image: "/gallery/image-5.jpeg" },
  { title: "Elegant Bedroom", image: "/gallery/image-6.jpeg" },
  { title: "Modern Room", image: "/gallery/image-7.jpeg" },
  { title: "Comfort Suite", image: "/gallery/image-8.jpeg" },
  { title: "Spacious Room", image: "/gallery/image-9.jpeg" },
  { title: "Master Suite", image: "/gallery/image-10.jpeg" },
];

export function GalleryClient() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomImages.map((item, index) => (
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
