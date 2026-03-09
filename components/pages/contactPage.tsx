"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const faqs = [
  {
    question: "What are your check-in and check-out times?",
    answer: "Standard check-in is at 2:00 PM and check-out is at 11:00 AM. Early check-in and late check-out may be available upon request, subject to availability."
  },
  {
    question: "Do you offer airport transfers?",
    answer: "Yes, we offer airport transfer services. Please contact us in advance to arrange your transfer. Additional charges may apply."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and digital payment methods. We use Yoco for secure payment processing."
  },
  {
    question: "Are pets allowed at the hotel?",
    answer: "We welcome well-behaved pets at our hotel. Please inform us during booking if you plan to bring a pet."
  },
  {
    question: "Is breakfast included in the room rate?",
    answer: "Breakfast options vary by room package. Please check your booking confirmation or contact us for details about your specific package."
  },
  {
    question: "Do you have WiFi throughout the hotel?",
    answer: "Yes, complimentary high-speed WiFi is available throughout the entire hotel for all guests."
  }
];

export function ContactClient() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop"
            alt="Contact Us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative text-center text-white">
          <h1 className="text-5xl font-semibold mb-3">Contact Us</h1>
          <p className="text-xl text-gray-100 max-w-2xl">Get in touch with our team. We're here to help you plan your perfect stay.</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Contact Cards and Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-10 items-start">
            {/* Left Side: Contact Info Cards & Map */}
            <div>
              {/* Contact Info Panel */}
              <div className="bg-white border border-gray-300 rounded-2xl p-8 mb-12 lg:min-h-[780px]">
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-8">Get In Touch</h2>

                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl md:text-2xl text-gray-900 mb-2">Address</h3>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed">78 Jean Avenue, Doringkloof, Centurion</p>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed">South Africa</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl md:text-2xl text-gray-900 mb-2">Phone</h3>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed">012 006 6778</p>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed">076 053 8540</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl md:text-2xl text-gray-900 mb-2">Email</h3>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed">info@78onjean.co.za</p>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed">bookings@78onjean.co.za</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl md:text-2xl text-gray-900 mb-2">Reception Hours</h3>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed">24/7 Available</p>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed">Check-in: 2:00 PM</p>
                      <p className="text-gray-600 text-base md:text-lg leading-relaxed">Check-out: 10:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Location */}
              <div className="rounded-lg overflow-hidden shadow-lg border border-gray-300">
                <iframe
                  width="100%"
                  height="300"
                  frameBorder="0"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3590.3668689235224!2d28.202451473762487!3d-25.857400177291876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e95653d1e2ee2df%3A0x3eef6fb6c76da8b2!2s78onJean!5e0!3m2!1sen!2s!4v1773059630675!5m2!1sen!2s"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="78 On Jean Location"
                ></iframe>
              </div>
            </div>

            {/* Right Side: Send Us a Message */}
            <div>
              <div className="bg-white border border-gray-300 rounded-2xl p-8 lg:min-h-[780px]">
                <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-gray-900">Send us a Message</h2>
                <form className="space-y-5">
                  {/* Row 1: Full Name and Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base md:text-lg font-medium text-gray-900 mb-2">Full Name *</label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        className="h-12 bg-gray-100 text-gray-800 text-base md:text-lg border border-gray-200 rounded-lg placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block text-base md:text-lg font-medium text-gray-900 mb-2">Email Address *</label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        className="h-12 bg-gray-100 text-gray-800 text-base md:text-lg border border-gray-200 rounded-lg placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-amber-600"
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone and Subject */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base md:text-lg font-medium text-gray-900 mb-2">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="+27"
                        className="h-12 bg-gray-100 text-gray-800 text-base md:text-lg border border-gray-200 rounded-lg placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block text-base md:text-lg font-medium text-gray-900 mb-2">Subject *</label>
                      <Input
                        type="text"
                        placeholder="Booking inquiry"
                        className="h-12 bg-gray-100 text-gray-800 text-base md:text-lg border border-gray-200 rounded-lg placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-amber-600"
                      />
                    </div>
                  </div>

                  {/* Row 3: Message */}
                  <div>
                    <label className="block text-base md:text-lg font-medium text-gray-900 mb-2">Message *</label>
                    <textarea
                      placeholder="Tell us how we can help you..."
                      rows={7}
                      className="w-full bg-gray-100 text-gray-800 text-base md:text-lg border border-gray-300 rounded-lg p-4 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none"
                    />
                  </div>

                  {/* Button */}
                  <Button className="w-full h-12 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-base md:text-lg font-medium">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-700 font-medium">Find quick answers to common guest questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.slice(0, 4).map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-300 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-700 font-medium leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
