"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Coffee, Utensils, ChevronRight, Award, Users, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { FaAward, FaArrowRight } from "react-icons/fa";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SearchBar } from "@/components/SearchBar";

export function HomeClient() {
  const [email, setEmail] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isHoveringTestimonials, setIsHoveringTestimonials] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(3);

  const stats = [
    { number: "500+", label: "Happy Guests", icon: Users },
    { number: "7", label: "Luxury Rooms", icon: Star },
    { number: "15+", label: "Years Experience", icon: Award },
    { number: "24/7", label: "Support", icon: Clock },
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      location: "London, UK",
      rating: 5,
      comment: "Absolutely stunning hotel! The service was impeccable and the rooms were beautifully designed. The spa treatments were divine.",
    },
    {
      name: "James Peterson",
      location: "New York, USA",
      rating: 5,
      comment: "Best hotel experience in South Africa. The staff went above and beyond to make our stay memorable. Highly recommend!",
    },
    {
      name: "Emma van der Berg",
      location: "Johannesburg, SA",
      rating: 5,
      comment: "A hidden gem! Every detail was perfect. The breakfast was exceptional and the amenities are world-class.",
    },
    {
      name: "Michael Chen",
      location: "Singapore",
      rating: 5,
      comment: "Exceptional hospitality and attention to detail. The views are absolutely breathtaking and the staff is incredibly courteous.",
    },
    {
      name: "Isabella Rodriguez",
      location: "Madrid, Spain",
      rating: 5,
      comment: "A luxury experience like no other! The rooms are elegantly furnished and the dining experience is unforgettable.",
    },
    {
      name: "David Thompson",
      location: "Toronto, Canada",
      rating: 5,
      comment: "Truly world-class! Every moment at this hotel was special. Can't wait to return for another amazing stay.",
    },
  ];

  const maxSlideIndex = Math.max(testimonials.length - cardsPerView, 0);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);

    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  useEffect(() => {
    setCurrentTestimonial((prev) => Math.min(prev, maxSlideIndex));
  }, [maxSlideIndex]);

  useEffect(() => {
    if (isHoveringTestimonials) return;
    
    const interval = setInterval(() => {
      if (maxSlideIndex === 0) return;
      setCurrentTestimonial((prev) => (prev + 1) % (maxSlideIndex + 1));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isHoveringTestimonials, maxSlideIndex]);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    toast.success("Successfully subscribed to our newsletter!");
    setEmail("");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="home-hero" className="relative min-h-[980px] md:min-h-[900px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1592383809697-4986ac3151c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwc291dGglMjBhZnJpY2F8ZW58MXx8fHwxNzcyMjA0MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Luxury Hotel Lobby"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        <div className="relative container mx-auto px-4 min-h-[980px] md:min-h-[900px] flex flex-col">
          {/* Hero Content - Centered */}
          <div className="flex-1 flex items-start md:items-center justify-center pt-20 md:pt-0">
            <div className="max-w-5xl w-full px-2 sm:px-4">
              <div className="text-center text-white mb-8 md:mb-12">
                <Badge className="mt-6 md:mt-8 mb-4 md:mb-6 bg-gray-900 hover:bg-black text-white border-0 px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm backdrop-blur-sm inline-flex items-center gap-2">
                  <FaAward className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-300" />
                  Award Winning Hotel in South Africa
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-4 md:mb-6 leading-tight font-light tracking-tight px-4">
                  Welcome to <span className="block font-semibold mt-2">78 On Jean</span>
                </h1>
                <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-10 text-gray-200 max-w-2xl mx-auto font-light px-4">
                  Experience luxury hospitality in the heart of South Africa. Where comfort meets elegance.
                </p>
              </div>

              {/* Search Bar */}
              <div className="mb-6 md:mb-8">
                <SearchBar />
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 px-4">
                <Link href="/book-now" className="w-full sm:w-auto">
                  <Button size="default" className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-6 py-3">
                    Book Your Stay
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/rooms" className="w-full sm:w-auto">
                  <Button 
                    size="default" 
                    variant="outline" 
                    className="w-full sm:w-auto bg-transparent hover:bg-white text-white hover:text-[#000B1C] border-white px-6 py-3 transition-all duration-300"
                    style={{ borderWidth: '1.5px' }}
                  >
                    Explore Rooms
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats at Bottom */}
          <div className="pb-8 md:pb-12 pt-6 md:pt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center text-white">
                    <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gray-700/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 border border-gray-600/30">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-gray-300" />
                    </div>
                    <div className="text-2xl md:text-3xl lg:text-4xl mb-1">{stat.number}</div>
                    <div className="text-xs md:text-sm lg:text-base text-gray-300">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights - Clean Cards */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4 text-[#0A0A0A] ">Why Choose Us</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience world-class hospitality with premium amenities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Award, title: "Award Winning", description: "Recognized for excellence in hospitality" },
              { icon: Star, title: "5-Star Service", description: "Exceptional service, every time" },
              { icon: Clock, title: "24/7 Concierge", description: "Always here to assist you" },
              { icon: Sparkles, title: "Luxury Amenities", description: "Everything you need for a perfect stay" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-amber-600 transition-all duration-300">
                    <Icon className="w-10 h-10 text-amber-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl mb-2 font-medium text-[#0A0A0A]">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl mb-3 text-[#0A0A0A]">Luxury Accommodations</h2>
              <p className="text-gray-600 text-lg">
                Beautifully designed rooms and suites
              </p>
            </div>
            <Link href="/rooms">
              <Button variant="outline" className="border-2 bg-gray-900  hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-colors">
                View All Rooms <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Standard Room",
                image: "https://images.unsplash.com/photo-1766928210443-0be92ed5884a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGJlZHJvb20lMjBtb2Rlcm58ZW58MXx8fHwxNzcyMjA0MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                price: "R1,200",
                features: ["King Bed", "City View", "25 m²"],
              },
              {
                title: "Deluxe Suite",
                image: "https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWx1eGUlMjBob3RlbCUyMHN1aXRlJTIwYmVkcm9vbXxlbnwxfHx8fDE3NzIyMDQxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                price: "R2,500",
                features: ["King Bed", "Ocean View", "35 m²"],
              },
              {
                title: "Presidential Suite",
                image: "https://images.unsplash.com/photo-1664780476492-fbb9fd277ce8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHByZXNpZGVudGlhbCUyMHN1aXRlJTIwbHV4dXJ5fGVufDF8fHx8MTc3MjEyMDA2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                price: "R5,000",
                features: ["King Bed", "Panoramic View", "100 m²"],
              },
            ].map((room, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0">
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl mb-3 text-[#0A0A0A]">{room.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.features.map((feature, i) => (
                      <span key={i} className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <span className="text-3xl text-amber-600">{room.price}</span>
                      <span className="text-gray-500 text-sm ml-2">/ night</span>
                    </div>
                    <Link href="/book-now">
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

      {/* Dining Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
                Award-Winning Cuisine
              </Badge>
              <h2 className="text-4xl md:text-5xl mb-4 text-[#0A0A0A]">Culinary Excellence</h2>
              <p className="text-gray-600 text-lg mb-8">
                From hearty breakfasts to elegant dinners, our menu features locally-sourced 
                ingredients and international flavors. Experience culinary artistry at every meal.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: "Breakfast", time: "7:00 AM - 11:00 AM", icon: Coffee },
                  { label: "Lunch", time: "12:00 PM - 4:00 PM", icon: Utensils },
                  { label: "Dinner", time: "6:00 PM - 10:30 PM", icon: Utensils },
                  { label: "Room Service", time: "24/7 Available", icon: Clock },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-gray-50 p-5 rounded-xl">
                      <Icon className="w-5 h-5 text-amber-600 mb-2" />
                      <h4 className="font-semibold mb-1 text-[#0A0A0A]">{item.label}</h4>
                      <p className="text-sm text-gray-600">{item.time}</p>
                    </div>
                  );
                })}
              </div>
              <Link href="/menu" className="block">
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  View Full Menu
                  <FaArrowRight className="ml-2 w-4 h-4 animate-slide-arrow-hover" />
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2 h-[500px] rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1543353071-873f17a7a088?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcmVzdGF1cmFudCUyMHBsYXRlZCUyMGZvb2R8ZW58MXx8fHwxNzcyMTE5NDgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Fine Dining"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Spa Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="h-[500px] rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1757689314932-bec6e9c39e51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2V8ZW58MXx8fHwxNzcyMTg1NzgzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Spa"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div>
              <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
                Premium Wellness
              </Badge>
              <h2 className="text-4xl md:text-5xl mb-4 text-[#0A0A0A]">Spa & Wellness</h2>
              <p className="text-gray-600 text-lg mb-8">
                Our world-class spa offers a range of treatments designed to help you
                unwind and refresh. From massages to manicures, we have everything you
                need for the ultimate relaxation experience.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Professional Massage Therapy",
                  "Manicure & Pedicure Services",
                  "Facial Treatments",
                  "Aromatherapy Sessions"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/spa" className="block">
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  Book Spa Treatment
                  <FaArrowRight className="ml-2 w-4 h-4 animate-slide-arrow-hover" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4 text-[#0A0A0A]">Guest Reviews</h2>
            <p className="text-gray-600 text-lg">
              What our guests say about their experience
            </p>
          </div>
          <div 
            className="overflow-hidden"
            onMouseEnter={() => setIsHoveringTestimonials(true)}
            onMouseLeave={() => setIsHoveringTestimonials(false)}
          >
            <div className="flex transition-transform duration-700 ease-out" style={{
              transform: `translateX(-${(currentTestimonial * 100) / cardsPerView}%)`
            }}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-2 sm:px-3 md:px-4">
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-gray-50 h-full flex flex-col">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed flex-1">"{testimonial.comment}"</p>
                    <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-shrink-0 items-center justify-center text-white text-lg font-semibold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.location}</div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: maxSlideIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-amber-600 w-8' : 'bg-gray-300 hover:bg-amber-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-amber-600 to-amber-700">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-5xl mb-4">Stay Connected</h2>
            <p className="text-base md:text-xl mb-8 text-amber-50">
              Subscribe for exclusive offers and updates
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-4 max-w-xl w-full mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full flex-1 h-14 px-6 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 backdrop-blur-sm"
              />
              <Button type="submit" size="lg" className="w-full sm:w-auto bg-white text-amber-600 hover:bg-gray-50 h-14 px-8">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {/* <section className="py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl mb-6">Ready for Your Perfect Stay?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-300">
            Book now and experience the finest hospitality South Africa has to offer
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/booking">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-lg px-10 py-6 h-auto">
                Book Your Stay
                <ChevronRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 text-lg px-10 py-6 h-auto">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section> */}
    </div>
  );
}
