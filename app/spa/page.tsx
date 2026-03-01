import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Spa & Wellness - 78 On Jean",
  description: "Experience our world-class spa and wellness treatments.",
};

const treatments = [
  {
    name: "Swedish Massage",
    duration: "60 min",
    price: "R450",
    description: "Classic relaxation massage to ease tension and stress."
  },
  {
    name: "Deep Tissue Massage",
    duration: "90 min",
    price: "R650",
    description: "Intense massage targeting problem areas and chronic tension."
  },
  {
    name: "Facial Treatment",
    duration: "45 min",
    price: "R350",
    description: "Professional facial for rejuvenated and glowing skin."
  },
  {
    name: "Hot Stone Therapy",
    duration: "75 min",
    price: "R550",
    description: "Ancient healing technique using heated stones."
  },
  {
    name: "Aromatherapy Session",
    duration: "60 min",
    price: "R400",
    description: "Therapeutic session using essential oils for wellness."
  },
  {
    name: "Manicure & Pedicure",
    duration: "90 min",
    price: "R500",
    description: "Complete nail care with luxury pampering included."
  },
];

export default function SpaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1757689314932-bec6e9c39e51?w=1200&h=400&fit=crop"
            alt="Spa"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-indigo-900/80" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4">Spa & Wellness</h1>
            <p className="text-xl text-purple-100">Rejuvenate your body and mind</p>
          </div>
        </div>
      </section>

      {/* Treatments */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {treatments.map((treatment, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{treatment.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{treatment.duration}</p>
                <p className="text-gray-700 mb-4">{treatment.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-amber-600">{treatment.price}</span>
                  <Link href="/booking">
                    <Button className="bg-amber-600 hover:bg-amber-700">Book</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
