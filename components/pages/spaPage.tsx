"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { saveSpaBooking } from "@/lib/spaBookingService";

const treatments = [
  {
    id: 1,
    name: "Swedish Massage",
    duration: "60 min",
    price: 450,
    description: "Classic relaxation massage to ease tension and stress.",
    category: "February special"
  },
  {
    id: 2,
    name: "Deep Tissue Massage",
    duration: "90 min",
    price: 650,
    description: "Intense massage targeting problem areas and chronic tension.",
    category: "Massage"
  },
  {
    id: 3,
    name: "Facial Treatment",
    duration: "45 min",
    price: 350,
    description: "Professional facial for rejuvenated and glowing skin.",
    category: "Spa packages"
  },
  {
    id: 4,
    name: "Hot Stone Therapy",
    duration: "75 min",
    price: 550,
    description: "Ancient healing technique using heated stones.",
    category: "February special"
  },
  {
    id: 5,
    name: "Aromatherapy Session",
    duration: "60 min",
    price: 400,
    description: "Therapeutic session using essential oils for wellness.",
    category: "Spa packages"
  },
  {
    id: 6,
    name: "Manicure & Pedicure",
    duration: "90 min",
    price: 500,
    description: "Complete nail care with luxury pampering included.",
    category: "Nails"
  },
];

const categories = ["February special", "Spa packages", "Massage", "Nails"];

const professionals = [
  { id: 0, name: "Ava Mokoena", specialty: "Massage Therapy", rating: 4.8, isAny: false },
  { id: 1, name: "Mia Khumalo", specialty: "Holistic Wellness", rating: 4.9, isAny: false },
  { id: 2, name: "Liam van Wyk", specialty: "Deep Tissue Specialist", rating: 5.0, isAny: false },
  { id: 3, name: "Zoe Naidoo", specialty: "Skin & Facial Care", rating: 4.7, isAny: false },
];

const timeSlots = [
  "9:00 am - 10:30 am",
  "10:30 am - 12:00 pm",
  "12:00 pm - 1:30 pm",
  "1:30 pm - 3:00 pm",
  "3:00 pm - 4:30 pm",
  "4:30 pm - 6:00 pm",
];

export function SpaClient() {
  const [step, setStep] = useState(1);
  const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("February special");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState("");

  const { user } = useAuth();

  const selectedTreatments = treatments.filter((t) => selectedTreatmentIds.includes(t.id.toString()));
  const selectedProfessional = professionals.find((p) => p.id.toString() === selectedProfessionalId);
  const totalPrice = selectedTreatments.reduce((sum, t) => sum + t.price, 0);
  const taxesAndFees = Math.round(totalPrice * 0.15);
  const filteredTreatments = treatments.filter((t) => t.category === selectedCategory);

  const toggleTreatment = (id: string) => {
    setSelectedTreatmentIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  // Generate next 7 days for date picker
  const getNextSevenDays = () => {
    const days = [];
    const today = new Date(currentMonth);
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const nextWeek = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentMonth(newDate);
  };

  const prevWeek = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentMonth(newDate);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedTreatmentIds.length === 0) {
      return;
    }

    if (step === 2 && !selectedProfessionalId) {
      return;
    }

    if (step === 3 && (!appointmentDate || !selectedTime)) {
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    }
  };

  const canContinue =
    (step === 1 && selectedTreatmentIds.length > 0) ||
    (step === 2 && !!selectedProfessionalId) ||
    (step === 3 && !!appointmentDate && !!selectedTime);

  const handleSubmitSpaBooking = async () => {
    if (selectedTreatments.length === 0 || !selectedProfessional || !appointmentDate || !selectedTime) {
      toast.error("Please complete all selections before confirming.");
      return;
    }

    if (!guestName || !guestEmail || !guestPhone) {
      toast.error("Please fill in your contact details.");
      return;
    }

    if (!user) {
      toast.error("Please sign in to complete your spa booking.");
      return;
    }

    setIsSubmitting(true);
    try {
      const serviceNames = selectedTreatments.map((t) => t.name).join(", ");
      const totalDuration = selectedTreatments.map((t) => t.duration).join(", ");

      const result = await saveSpaBooking(user.uid, {
        serviceName: serviceNames,
        duration: totalDuration,
        professionalName: selectedProfessional.name,
        appointmentDate,
        appointmentTime: selectedTime,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        totalPrice,
        taxesAndFees,
      });

      if (result.success) {
        // Generate booking reference
        const reference = `SPA-${Date.now().toString().slice(-6).toUpperCase()}`;
        setBookingReference(reference);
        setShowConfirmation(true);
        
        // Reset form
        setStep(1);
        setSelectedTreatmentIds([]);
        setSelectedProfessionalId("");
        setAppointmentDate("");
        setSelectedTime("");
        setGuestName("");
        setGuestEmail("");
        setGuestPhone("");
        setSpecialRequests("");
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to save spa booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1757689314932-bec6e9c39e51?w=1200&h=500&fit=crop"
            alt="Spa"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 via-amber-800/70 to-amber-900/80" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center text-center">
          <div className="max-w-3xl text-white px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4 font-semibold">Spa & Wellness</h1>
            <p className="text-base md:text-xl">Rejuvenate your body and mind with our premium treatments</p>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            {[
              { number: 1, label: "Services" },
              { number: 2, label: "Professional" },
              { number: 3, label: "Time" },
              { number: 4, label: "Confirm" },
            ].map((item, index) => (
              <div key={item.number} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= item.number ? "bg-amber-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > item.number ? <Check className="w-5 h-5" /> : item.number}
                  </div>
                  <span className={`hidden md:block ${step >= item.number ? "text-gray-900" : "text-gray-500"}`}>
                    {item.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-10 md:w-16 h-1 mx-2 md:mx-4 ${step > item.number ? "bg-amber-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spa Booking Flow */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-start">
            {/* Left: Steps Content */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                {step === 1 && (
                  <div>
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-xl -mx-6 -mt-6 px-6 py-8 mb-6">
                      <h2 className="text-3xl text-white font-bold mb-2">Choose Your Services</h2>
                      <p className="text-amber-50">Select one or more treatments for your perfect spa day</p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === category
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    {/* Service Cards */}
                    <div className="space-y-4">
                      {filteredTreatments.map((treatment) => (
                        <div
                          key={treatment.id}
                          onClick={() => toggleTreatment(treatment.id.toString())}
                          className={`p-5 rounded-xl border-2 cursor-pointer transition-all relative ${
                            selectedTreatmentIds.includes(treatment.id.toString())
                              ? "border-amber-600 bg-amber-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{treatment.name}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {treatment.duration}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-4">{treatment.description}</p>
                              <p className="text-2xl font-bold text-gray-900">
                                R{treatment.price.toLocaleString()}
                              </p>
                            </div>
                            <button
                              className={`ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                selectedTreatmentIds.includes(treatment.id.toString())
                                  ? "bg-green-500 text-white"
                                  : "bg-white border-2 border-gray-300 text-gray-600 hover:border-amber-600"
                              }`}
                            >
                              {selectedTreatmentIds.includes(treatment.id.toString()) ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                <span className="text-xl font-light">+</span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-xl -mx-6 -mt-6 px-6 py-8 mb-6">
                      <h2 className="text-3xl text-white font-bold mb-2">Choose Your Professional</h2>
                      <p className="text-amber-50">Select your preferred therapist or let us choose for you</p>
                    </div>

                    {/* Professional Cards */}
                    <div className="space-y-4">
                      {professionals.map((professional) => (
                        <div
                          key={professional.id}
                          onClick={() => setSelectedProfessionalId(professional.id.toString())}
                          className={`p-5 rounded-xl border-2 cursor-pointer transition-all relative ${
                            selectedProfessionalId === professional.id.toString()
                              ? "border-amber-600 bg-amber-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Avatar Icon */}
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              professional.isAny ? "bg-amber-600" : "bg-gradient-to-br from-amber-500 to-amber-600"
                            }`}>
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>

                            {/* Professional Info */}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{professional.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{professional.specialty}</p>
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-sm font-semibold text-gray-900">{professional.rating}</span>
                                <span className="text-sm text-gray-600">average rating</span>
                              </div>
                            </div>

                            {/* Checkmark */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                              selectedProfessionalId === professional.id.toString()
                                ? "bg-green-500 text-white"
                                : "bg-white border-2 border-gray-300 text-gray-600"
                            }`}>
                              {selectedProfessionalId === professional.id.toString() && (
                                <Check className="w-5 h-5" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-xl -mx-6 -mt-6 px-6 py-8 mb-6">
                      <h2 className="text-3xl text-white font-bold mb-2">Select Date & Time</h2>
                      <p className="text-amber-50">Choose when you'd like to visit us</p>
                    </div>

                    {/* Calendar Date Picker */}
                    <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </h3>
                          <p className="text-sm text-gray-600">Select your preferred date</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={prevWeek}
                            className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={nextWeek}
                            className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Date Cards */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {getNextSevenDays().map((date, index) => {
                          const dateStr = formatDateForInput(date);
                          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                          const dayNum = date.getDate();
                          const isSelected = appointmentDate === dateStr;
                          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => !isPast && setAppointmentDate(dateStr)}
                              disabled={isPast}
                              className={`flex-shrink-0 w-24 h-24   rounded-2xl flex flex-col items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-amber-600 text-white shadow-lg"
                                  : isPast
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                              }`}
                            >
                              <span className={`text-2xl font-semibold mb-1 ${isSelected ? "text-white" : "text-gray-900"}`}>
                                {dayNum}
                              </span>
                              <span className={`text-xs ${isSelected ? "text-amber-100" : "text-gray-600"}`}>
                                {dayName}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Available Time Slots */}
                    <div className="p-6 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900">Available Time Slots</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            disabled={!appointmentDate}
                            className={`rounded-xl px-4 py-4 text-sm font-semibold transition-all ${
                              selectedTime === slot
                                ? "bg-amber-600 text-white shadow-md"
                                : appointmentDate
                                ? "bg-white text-gray-800 border border-gray-200 hover:border-amber-300"
                                : "bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl text-gray-900 font-semibold">Confirm Your Details</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-gray-900 font-semibold">Full Name</Label>
                        <Input
                          id="name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="mt-2 bg-white text-gray-900 font-medium border-gray-300 border-2 placeholder:text-gray-400 focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-900 font-semibold">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="mt-2 bg-white text-gray-900 font-medium border-gray-300 border-2 placeholder:text-gray-400 focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-gray-900 font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="mt-2 bg-white text-gray-900 font-medium border-gray-300 border-2 placeholder:text-gray-400 focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                        placeholder="+27 123 456 7890"
                      />
                    </div>

                    <div>
                      <Label htmlFor="requests" className="text-gray-900 font-semibold">Special Requests (Optional)</Label>
                      <textarea
                        id="requests"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full mt-2 p-3 bg-white text-gray-900 font-medium border-2 border-gray-300 rounded-md min-h-[100px] placeholder:text-gray-400 focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                        placeholder="Any special preferences or health concerns..."
                      />
                    </div>

  
                  </div>
                )}

                <div className="flex gap-4 mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(step - 1)} 
                    className="flex-1"
                    disabled={step === 1}
                  >
                    Back
                  </Button>
                  {step < 4 ? (
                    <Button
                      onClick={handleNextStep}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                      disabled={!canContinue}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                      onClick={handleSubmitSpaBooking}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Complete Booking"}
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Right: Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 lg:max-w-md xl:max-w-none">
                <h3 className="text-xl mb-4 text-gray-900 font-semibold">Booking Summary</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Services ({selectedTreatments.length})</p>
                    {selectedTreatments.length > 0 ? (
                      <div className="space-y-2">
                        {selectedTreatments.map((treatment) => (
                          <div key={treatment.id} className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">{treatment.name}</p>
                              <p className="text-xs text-gray-600">{treatment.duration}</p>
                            </div>
                            <p className="font-medium text-gray-900 text-sm">R{treatment.price.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-semibold text-gray-900">Not selected</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Professional</p>
                    <p className="font-semibold text-gray-900">{selectedProfessional?.name || "Not selected"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">
                      {appointmentDate 
                        ? new Date(appointmentDate + 'T00:00:00').toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : "Not selected"
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold text-gray-900">{selectedTime || "Not selected"}</p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 text-sm">Service price</span>
                      <span className="font-medium text-gray-900">R{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 text-sm">Taxes & fees</span>
                      <span className="font-medium text-gray-900">R{taxesAndFees.toLocaleString()}</span>
                    </div>
                    <div className="pt-4 border-t flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl text-amber-600 font-bold">
                        R{(totalPrice + taxesAndFees).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md border border-gray-700 bg-gray-900 text-gray-100 shadow-2xl">
          <DialogHeader>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-300">
              <Check className="w-8 h-8 text-amber-700" />
            </div>
            <DialogTitle className="text-center text-2xl font-semibold text-white">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center text-gray-300">
              <div className="space-y-4 mt-4">
                <p className="text-gray-200">Your spa appointment has been successfully booked.</p>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Booking Reference</p>
                  <p className="text-2xl font-mono font-semibold text-amber-400">{bookingReference}</p>
                </div>
                <p className="text-sm text-gray-300">
                  A confirmation email has been sent to <span className="text-white font-medium">{guestEmail}</span>
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              setShowConfirmation(false);
              window.location.href = "/";
            }}
            className="w-full bg-amber-600 text-white hover:bg-amber-700"
          >
            Back to Home
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
