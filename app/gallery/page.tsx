import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery - 78 On Jean",
  description: "Browse our gallery of beautiful hotel spaces and amenities.",
};

const galleryImages = [
  {
    title: "Lobby",
    image: "https://images.unsplash.com/photo-1592383809697-4986ac3151c6?w=400&h=400&fit=crop"
  },
  {
    title: "Pool Area",
    image: "https://images.unsplash.com/photo-1601584942745-8880755f5880?w=400&h=400&fit=crop"
  },
  {
    title: "Dining",
    image: "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=400&h=400&fit=crop"
  },
  {
    title: "Bedroom",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop"
  },
  {
    title: "Spa",
    image: "https://images.unsplash.com/photo-1757689314932-bec6e9c39e51?w=400&h=400&fit=crop"
  },
  {
    title: "Conference",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop"
  },
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Our Gallery</h1>
            <p className="text-xl text-gray-600">Explore the beauty of 78 On Jean</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((item, index) => (
              <div key={index} className="group overflow-hidden rounded-lg shadow-lg">
                <div className="h-80 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
