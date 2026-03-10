"use client";

import Link from "next/link";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Coffee, Utensils, ChevronRight, Clock, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { FaAward, FaArrowRight } from "react-icons/fa";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SearchBar } from "@/components/SearchBar";
import { getAllRooms, Room } from "@/lib/roomService";

type Testimonial = {
  name: string;
  location: string;
  rating: number;
  comment: string;
};

const fallbackTestimonials: Testimonial[] = [
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

export function HomeClient() {
  const [email, setEmail] = useState("");
  const t = useTranslations();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isHoveringTestimonials, setIsHoveringTestimonials] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);

  const stats = [
    { number: "7", label: t("home.stats.rooms"), icon: Star },
    { number: "100%", label: t("home.stats.clean"), icon: Sparkles },
    { number: "50+", label: t("home.stats.menu"), icon: Utensils },
    { number: "24/7", label: t("home.stats.support"), icon: Clock },
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

  useEffect(() => {
    const fetchGoogleReviews = async () => {
      try {
        const response = await fetch("/api/google-reviews");
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data?.reviews) || data.reviews.length === 0) {
          return;
        }

        const normalized: Testimonial[] = data.reviews
          .filter((review: Testimonial) => review.comment)
          .slice(0, 6)
          .map((review: Testimonial) => ({
            name: review.name || "Guest",
            location: review.location || "Google Review",
            rating: review.rating || 5,
            comment: review.comment,
          }));

        if (normalized.length > 0) {
          setTestimonials(normalized);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Using fallback testimonials:", error);
        }
      }
    };

    fetchGoogleReviews();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const allRooms = await getAllRooms();
        if (allRooms.length === 0) {
          // Use fallback dummy data if database is empty
          const fallbackRooms = [
            {
              id: "fallback-1",
              name: "Deluxe Double Room",
              slug: "deluxe-double-room",
              price: "R1,800",
              priceNumeric: 1800,
              image: "/rooms/r3-deluxe/deluxe-1.jpg",
              maxGuests: 2,
              bedType: "1 Double Bed",
              size: "30 m²",
              view: "Garden View",
              description: "Comfy Deluxe Double Room with 1 double bed, private bathroom, and garden views.",
              amenities: ["Garden View", "Streaming TV", "Tea/Coffee Maker"],
              available: true
            },
            {
              id: "fallback-2",
              name: "Deluxe Double Room with Bath",
              slug: "deluxe-double-room-with-bath",
              price: "R2,100",
              priceNumeric: 2100,
              image: "/rooms/r2-deluxe-bath/deluxe-bath-7.jpg",
              maxGuests: 2,
              bedType: "1 Double Bed",
              size: "25 m²",
              view: "Garden View",
              description: "25 m² Deluxe Double Room with bath, private bathroom, minibar, coffee machine.",
              amenities: ["Bath", "Private Bathroom", "Flat-screen TV"],
              available: true
            },
            {
              id: "fallback-3",
              name: "Family Double Room",
              slug: "family-double-room",
              price: "R2,500",
              priceNumeric: 2500,
              image: "/rooms/r1-family/family-6.jpg",
              maxGuests: 4,
              bedType: "2 Double Beds",
              size: "25 m²",
              view: "Garden View",
              description: "25 m² Family Double Room with 2 double beds, perfect for families.",
              amenities: ["Private Bathroom", "Flat-screen TV", "Board Games"],
              available: true
            }
          ] as Room[];
          setRooms(fallbackRooms);
          return;
        }
        // Only show available rooms and limit to 3 for home page
        // Show rooms with id 1, 2, and 3 if available
        const prioritizedIds = ["1", "2", "3"];
        const prioritizedRooms = prioritizedIds
          .map(id => allRooms.find(room => room.available && String(room.id) === id))
          .filter(Boolean) as Room[];
        if (prioritizedRooms.length === 0) {
          toast.warning("All rooms are currently unavailable");
        }
        setRooms(prioritizedRooms);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load rooms";
        // Check for specific error types
        const isAuthDisabled = errorMessage === 'AUTH_DISABLED';
        const isAuthError = errorMessage.startsWith('AUTH_ERROR:');
        const isPermissionError = errorMessage === 'PERMISSION_DENIED';
        // Use fallback on error
        const fallbackRooms = [
          {
            id: "fallback-1",
            name: "Deluxe Double Room",
            slug: "deluxe-double-room",
            price: "R1,800",
            priceNumeric: 1800,
            image: "/rooms/r3-deluxe/deluxe-6.jpg",
            maxGuests: 2,
            bedType: "1 Double Bed",
            size: "30 m²",
            view: "Garden View",
            description: "Comfy Deluxe Double Room with 1 double bed, private bathroom, and garden views.",
            amenities: ["Garden View", "Streaming TV", "Tea/Coffee Maker"],
            available: true
          },
          {
            id: "fallback-2",
            name: "Deluxe Double Room with Bath",
            slug: "deluxe-double-room-with-bath",
            price: "R2,100",
            priceNumeric: 2100,
            image: "/rooms/r2-deluxe-bath/deluxe-bath-7.jpg",
            maxGuests: 2,
            bedType: "1 Double Bed",
            size: "25 m²",
            view: "Garden View",
            description: "25 m² Deluxe Double Room with bath, private bathroom, minibar, coffee machine.",
            amenities: ["Bath", "Private Bathroom", "Flat-screen TV"],
            available: true
          },
          {
            id: "fallback-3",
            name: "Family Double Room",
            slug: "family-double-room",
            price: "R2,500",
            priceNumeric: 2500,
            image: "/rooms/r1-family/family-3.jpg",
            maxGuests: 4,
            bedType: "2 Double Beds",
            size: "25 m²",
            view: "Garden View",
            description: "25 m² Family Double Room with 2 double beds, perfect for families.",
            amenities: ["Private Bathroom", "Flat-screen TV", "Board Games"],
            available: true
          }
        ] as Room[];
        setRooms(fallbackRooms);
        // Only log in development mode, no user-facing errors for auth issues
        if (process.env.NODE_ENV === 'development') {
          if (isAuthDisabled) {
            console.info('ℹ️ Firebase anonymous auth is disabled. Using sample data. Enable it in Firebase Console > Authentication > Sign-in method > Anonymous.');
          } else if (isAuthError) {
            console.warn('⚠️ Firebase authentication error:', errorMessage);
          } else if (isPermissionError) {
            console.error('❌ Firestore permission denied. Check your Firestore rules.');
          } else {
            console.error('❌ Error loading rooms:', errorMessage);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

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
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-4 md:mb-6 leading-tight font-light tracking-tight px-4">
                  {t("home.hero.title")} <span className="block font-semibold mt-2">78 On Jean</span>
                </h1>
                <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-10 text-gray-200 max-w-2xl mx-auto font-light px-4">
                  {t("home.hero.subtitle")}
                </p>
              </div>

              {/* Search Bar */}
              <div className="mb-6 md:mb-8">
                <SearchBar />
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 px-4">
                <Link href="/book-now" className="w-full sm:w-auto">
                  <Button size="default" className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-6 py-3">
                    {t("home.hero.bookButton")}
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
                    {t("home.hero.exploreButton")}
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
            <h2 className="text-4xl md:text-5xl mb-4 text-[#0A0A0A] ">{t("home.whyChooseUs.title")}</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t("home.whyChooseUs.description")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: ShieldCheck, title: t("home.whyChooseUs.cards.0.title"), description: t("home.whyChooseUs.cards.0.description") },
              { icon: Star, title: t("home.whyChooseUs.cards.1.title"), description: t("home.whyChooseUs.cards.1.description") },
              { icon: CheckCircle2, title: t("home.whyChooseUs.cards.2.title"), description: t("home.whyChooseUs.cards.2.description") },
              { icon: Sparkles, title: t("home.whyChooseUs.cards.3.title"), description: t("home.whyChooseUs.cards.3.description") },
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
              <h2 className="text-4xl md:text-5xl mb-3 text-[#0A0A0A]">{t("home.roomsSection.title")}</h2>
              <p className="text-gray-600 text-lg">
                {t("home.roomsSection.description")}
              </p>
            </div>
            <Link href="/rooms">
              <Button variant="outline" className="border-2 bg-gray-900  hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-colors">
                {t("home.roomsSection.viewAllRooms")} <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden border-0 animate-pulse">
                  <div className="h-64 bg-gray-300" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-3" />
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="h-6 w-20 bg-gray-200 rounded-full" />
                      <div className="h-6 w-24 bg-gray-200 rounded-full" />
                      <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="h-8 w-32 bg-gray-300 rounded" />
                      <div className="h-10 w-24 bg-gray-300 rounded" />
                    </div>
                  </div>
                </Card>
              ))
            ) : rooms.length > 0 ? (
              rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 flex flex-col">
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={
                        room.id === "1" ? "/rooms/r3-deluxe/deluxe-6.jpg" :
                        room.id === "2" ? "/rooms/r2-deluxe-bath/deluxe-bath-7.jpg" :
                        room.id === "3" ? "/rooms/r1-family/family-3.jpg" : room.image
                      }
                      alt={room.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-2xl mb-3 text-[#0A0A0A] min-h-[64px] line-clamp-2">{room.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
                      {room.bedType && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {room.bedType}
                        </span>
                      )}
                      {room.view && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {room.view}
                        </span>
                      )}
                      {room.size && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {room.size}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t mt-auto">
                      <div>
                        <span className="text-3xl text-amber-600">{room.price}</span>
                        <span className="text-gray-500 text-sm ml-2">{t("home.roomsSection.perNight")}</span>
                      </div>
                      <Link href="/book-now">
                        <Button className="bg-amber-600 hover:bg-amber-700">
                          {t("book_now")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">{t("home.roomsSection.noRooms")}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dining Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
                {t("home.diningSection.badge")}
              </Badge>
              <h2 className="text-4xl md:text-5xl mb-4 text-[#0A0A0A]">{t("home.diningSection.title")}</h2>
              <p className="text-gray-600 text-lg mb-8">
                {t("home.diningSection.description")}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: t("home.diningSection.meals.0.label"), time: t("home.diningSection.meals.0.time"), icon: Coffee },
                  { label: t("home.diningSection.meals.1.label"), time: t("home.diningSection.meals.1.time"), icon: Utensils },
                  { label: t("home.diningSection.meals.2.label"), time: t("home.diningSection.meals.2.time"), icon: Utensils },
                  { label: t("home.diningSection.meals.3.label"), time: t("home.diningSection.meals.3.time"), icon: Clock },
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
                  {t("home.diningSection.viewMenu")}
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
                {t("home.spaSection.badge")}
              </Badge>
              <h2 className="text-4xl md:text-5xl mb-4 text-[#0A0A0A]">{t("home.spaSection.title")}</h2>
              <p className="text-gray-600 text-lg mb-8">
                {t("home.spaSection.description")}
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  t("home.spaSection.features.0"),
                  t("home.spaSection.features.1"),
                  t("home.spaSection.features.2"),
                  t("home.spaSection.features.3")
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/spa" className="block">
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  {t("home.spaSection.bookSpa")}
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
            <h2 className="text-4xl md:text-5xl mb-4 text-[#0A0A0A]">{t("home.testimonialsSection.title")}</h2>
            <p className="text-gray-600 text-lg">
              {t("home.testimonialsSection.description")}
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
            <h2 className="text-3xl md:text-5xl mb-4">{t("home.newsletterSection.title")}</h2>
            <p className="text-base md:text-xl mb-8 text-amber-50">
              {t("home.newsletterSection.description")}
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-4 max-w-xl w-full mx-auto">
              <Input
                type="email"
                placeholder={t("home.newsletterSection.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full flex-1 h-14 px-6 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 backdrop-blur-sm"
              />
              <Button type="submit" size="lg" className="w-full sm:w-auto bg-white text-amber-600 hover:bg-gray-50 h-14 px-8">
                {t("home.newsletterSection.button")}
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
