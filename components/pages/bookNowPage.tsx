"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarIcon, CreditCard, Check, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getRoomAvailabilityForRange, RoomAvailability, saveBooking, validateRoomAvailability } from "@/lib/bookingService";
import { getAllRooms, Room } from "@/lib/roomService";
import { YocoPaymentForm } from "@/components/YocoPaymentForm";

const PENDING_BOOKING_KEY = "pendingBookingDraft";
const PENDING_CHECKOUT_ID_KEY = "pendingYocoCheckoutId";

type PendingBookingDraft = {
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  roomId: string;
  roomPrice: number;
  nights: number;
  guests: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
  totalPrice: number;
  taxesAndFees: number;
};

export function BookingClient() {
  const [step, setStep] = useState(1);
  const [roomTypes, setRoomTypes] = useState<Room[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [availabilityByRoomId, setAvailabilityByRoomId] = useState<Record<string, RoomAvailability>>({});
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [guests, setGuests] = useState("2");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const loadRoomTypes = async () => {
      setIsRoomsLoading(true);
      try {
        const dbRooms = await getAllRooms();
        setRoomTypes(dbRooms.filter((room) => room.available));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load room types";
        toast.error(message);
      } finally {
        setIsRoomsLoading(false);
      }
    };

    loadRoomTypes();
  }, []);

  useEffect(() => {
    if (isRoomsLoading) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    // Do not override state when returning from payment callbacks.
    if (params.get("payment")) {
      return;
    }

    const roomIdParam = params.get("roomId");
    const roomName = params.get("room");
    const checkInParam = params.get("checkIn");
    const checkOutParam = params.get("checkOut");
    const guestsParam = params.get("guests");

    let hasPrefill = false;

    if (roomIdParam) {
      const byId = roomTypes.find((room) => room.id === roomIdParam);
      if (byId) {
        setSelectedRoomType(byId.id);
        hasPrefill = true;
      }
    } else if (roomName) {
      const matchedRoom = roomTypes.find((room) => room.name === roomName);
      if (matchedRoom) {
        setSelectedRoomType(matchedRoom.id);
        hasPrefill = true;
      }
    }

    if (checkInParam) {
      const parsedCheckIn = new Date(`${checkInParam}T00:00:00`);
      if (!Number.isNaN(parsedCheckIn.getTime())) {
        setCheckIn(parsedCheckIn);
        hasPrefill = true;
      }
    }

    if (checkOutParam) {
      const parsedCheckOut = new Date(`${checkOutParam}T00:00:00`);
      if (!Number.isNaN(parsedCheckOut.getTime())) {
        setCheckOut(parsedCheckOut);
        hasPrefill = true;
      }
    }

    if (guestsParam) {
      const parsedGuests = Number.parseInt(guestsParam, 10);
      if (Number.isInteger(parsedGuests) && parsedGuests > 0) {
        setGuests(parsedGuests.toString());
        hasPrefill = true;
      }
    }

    if (hasPrefill) {
      toast.success("Your search details are prefilled.", { id: "book-now-prefill" });
    }
  }, [isRoomsLoading, roomTypes]);

  useEffect(() => {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      setAvailabilityByRoomId({});
      return;
    }

    const loadAvailability = async () => {
      setIsAvailabilityLoading(true);
      try {
        const map = await getRoomAvailabilityForRange(checkIn, checkOut);
        setAvailabilityByRoomId(map);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load availability";
        toast.error(message);
      } finally {
        setIsAvailabilityLoading(false);
      }
    };

    loadAvailability();
  }, [checkIn, checkOut]);

  const selectedRoom = roomTypes.find((r) => r.id === selectedRoomType);
  const selectedRoomAvailability = useMemo(
    () => (selectedRoomType ? availabilityByRoomId[selectedRoomType] : undefined),
    [availabilityByRoomId, selectedRoomType]
  );

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();
  const totalPrice = selectedRoom ? (selectedRoom.priceNumeric || 0) * nights : 0;
  const taxesAndFees = Math.round(totalPrice * 0.15);
  const totalAmount = totalPrice + taxesAndFees;

  const savePendingBookingDraft = () => {
    if (!checkIn || !checkOut || !selectedRoom || !user) {
      return;
    }

    const draft: PendingBookingDraft = {
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      roomType: selectedRoom.name,
      roomId: selectedRoomType,
      roomPrice: selectedRoom.priceNumeric || 0,
      nights,
      guests,
      firstName,
      lastName,
      email,
      phone,
      specialRequests,
      totalPrice,
      taxesAndFees,
    };

    sessionStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(draft));
  };

  const completePendingBooking = async (paymentId: string) => {
    if (!user) {
      toast.error("You must be signed in to complete a booking");
      return;
    }

    const draftRaw = sessionStorage.getItem(PENDING_BOOKING_KEY);
    if (!draftRaw) {
      toast.error("Booking details not found. Please complete booking details again.");
      return;
    }

    const draft = JSON.parse(draftRaw) as PendingBookingDraft;

    setIsProcessing(true);

    try {
      const checkInDate = new Date(draft.checkInDate);
      const checkOutDate = new Date(draft.checkOutDate);

      const availability = await validateRoomAvailability(draft.roomId, checkInDate, checkOutDate);
      if (!availability.isAvailable) {
        throw new Error(availability.message || "Selected room type is no longer available for these dates.");
      }

      const bookingData = {
        checkInDate,
        checkOutDate,
        roomType: draft.roomType,
        roomId: draft.roomId,
        roomPrice: draft.roomPrice,
        nights: draft.nights,
        guests: draft.guests,
        firstName: draft.firstName,
        lastName: draft.lastName,
        email: draft.email,
        phone: draft.phone,
        specialRequests: draft.specialRequests,
        transactionId: paymentId,
        paymentMethod: "yoco" as const,
        paymentStatus: "completed" as const,
        totalPrice: draft.totalPrice,
        taxesAndFees: draft.taxesAndFees,
        // cardLast4 and cardholderName omitted - not available from Yoco Checkout API
      };

      const result = await saveBooking(user.uid, bookingData);

      if (!result.success) {
        throw new Error("Failed to save booking after payment");
      }

      const reference = "BK" + Math.random().toString(36).substr(2, 9).toUpperCase();
      setBookingReference(reference);

      // Clean up session storage and URL params
      sessionStorage.removeItem(PENDING_BOOKING_KEY);
      sessionStorage.removeItem(PENDING_CHECKOUT_ID_KEY);
      window.history.replaceState({}, "", "/book-now");

      // Show success message and redirect to bookings page
      toast.success("Booking confirmed! Redirecting to your bookings...");

      setTimeout(() => {
        window.location.href = "/booking";
      }, 1500);

      window.history.replaceState({}, "", "/book-now");
    } catch (error) {
      console.error("Booking completion error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to complete booking. Please contact support with your payment proof."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (!paymentStatus) {
      return;
    }

    if (paymentStatus === "cancelled") {
      toast.error("Payment was cancelled. You can try again.");
      window.history.replaceState({}, "", "/book-now");
      return;
    }

    if (paymentStatus === "failed") {
      toast.error("Payment failed. Please try again.");
      window.history.replaceState({}, "", "/book-now");
      return;
    }

    if (paymentStatus !== "success") {
      return;
    }

    const checkoutId = sessionStorage.getItem(PENDING_CHECKOUT_ID_KEY);
    if (!checkoutId) {
      toast.error("Could not verify payment session. Please contact support if you were charged.");
      window.history.replaceState({}, "", "/book-now");
      return;
    }

    const verifyCheckout = async () => {
      try {
        setIsProcessing(true);

        const response = await fetch(`/api/payments?checkoutId=${encodeURIComponent(checkoutId)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to verify payment");
        }

        if (data?.status !== "completed" || !data?.paymentId) {
          throw new Error("Payment is not completed yet. Please refresh in a moment.");
        }

        await completePendingBooking(data.paymentId);
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to verify payment status"
        );
      } finally {
        setIsProcessing(false);
      }
    };

    verifyCheckout();
  }, [user]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!checkIn || !checkOut || !selectedRoomType || !guests) {
        toast.error("Please fill in all booking details");
        return;
      }
      const guestCount = Number.parseInt(guests, 10);
      if (!Number.isInteger(guestCount) || guestCount < 1) {
        toast.error("Please enter a valid number of guests");
        return;
      }
      if (checkIn >= checkOut) {
        toast.error("Check-out date must be after check-in date");
        return;
      }

      if (!selectedRoom) {
        toast.error("Selected room type could not be loaded. Please reselect a room.");
        return;
      }

      if (guestCount > selectedRoom.maxGuests) {
        toast.error(`This room allows up to ${selectedRoom.maxGuests} guests.`);
        return;
      }

      if (isAvailabilityLoading) {
        toast.info("Checking availability. Please wait a moment.");
        return;
      }

      if (!selectedRoomAvailability || selectedRoomAvailability.availableUnits <= 0) {
        toast.error("Selected room type is fully booked for these dates. Please choose another option.");
        return;
      }

      setStep(2);
    } else if (step === 2) {
      if (!firstName || !lastName || !email || !phone) {
        toast.error("Please fill in all guest details");
        return;
      }
      if (!user) {
        toast.error("Please sign in to continue with your booking");
        return;
      }
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero with Image Background */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwcmVjZXB0aW9uJTIwYm9va2luZ3xlbnwxfHx8fDE3NDA2NzkyMDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Book Your Stay"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/80 via-amber-800/70 to-amber-900/80" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center justify-center text-center">
          <div className="max-w-3xl text-white px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4 font-semibold">Book Your Stay</h1>
            <p className="text-base md:text-xl">
              Complete your reservation in 3 easy steps
            </p>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            {[
              { number: 1, label: "Dates & Room" },
              { number: 2, label: "Guest Details" },
              { number: 3, label: "Payment" },
            ].map((item, index) => (
              <div key={item.number} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= item.number
                        ? "bg-amber-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > item.number ? <Check className="w-5 h-5" /> : item.number}
                  </div>
                  <span className={`hidden md:block ${step >= item.number ? "text-gray-900" : "text-gray-500"}`}>
                    {item.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-4 ${step > item.number ? "bg-amber-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-start">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                {/* Step 1: Dates & Room */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl mb-6 text-gray-900 font-semibold">Select Dates & Room</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Check-in */}
                      <div>
                        <Label htmlFor="checkin" className="text-gray-900 font-semibold">Check-in Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left mt-2 bg-white text-gray-900 font-medium border-gray-300 border-2 hover:border-amber-600 hover:bg-white focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                            >
                              <CalendarIcon className="mr-3 h-5 w-5 text-amber-600" />
                              {checkIn ? format(checkIn, "PPP") : "Select check-in date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white border-gray-200 border-2 shadow-lg rounded-lg">
                            <Calendar
                              mode="range"
                              selected={{ from: checkIn || undefined, to: checkOut || undefined }}
                              onSelect={(range: any) => {
                                if (range?.from) setCheckIn(range.from);
                                if (range?.to) setCheckOut(range.to);
                              }}
                              disabled={(date) => {
                                return date < new Date(new Date().setHours(0, 0, 0, 0));
                              }}
                            />
                            <div className="p-3 border-t bg-gray-50">
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                                  <span className="text-gray-700 font-medium">Selected</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                  <span className="text-gray-600 font-medium">Availability is calculated per room type</span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Check-out */}
                      <div>
                        <Label htmlFor="checkout" className="text-gray-900 font-semibold">Check-out Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left mt-2 bg-white text-gray-900 font-medium border-gray-300 border-2 hover:border-amber-600 hover:bg-white focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                            >
                              <CalendarIcon className="mr-3 h-5 w-5 text-amber-600" />
                              {checkOut ? format(checkOut, "PPP") : "Select check-out date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white border-gray-200 border-2 shadow-lg rounded-lg">
                            <Calendar
                              mode="range"
                              selected={{ from: checkIn || undefined, to: checkOut || undefined }}
                              onSelect={(range: any) => {
                                if (range?.from) setCheckIn(range.from);
                                if (range?.to) setCheckOut(range.to);
                              }}
                              disabled={(date) => {
                                if (date <= (checkIn || new Date())) return true;
                                return false;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Room Type */}
                    <div>
                      <Label htmlFor="room" className="text-gray-900 font-semibold">Room Type</Label>
                      <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                        <SelectTrigger className="mt-2 bg-white text-gray-900 font-medium border-gray-300 hover:border-amber-600 focus:border-amber-600 focus:ring-amber-600 focus:ring-2">
                          <SelectValue placeholder="Select room type" className="text-gray-900" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 border-2">
                          {roomTypes.map((room) => (
                            (() => {
                              const availability = availabilityByRoomId[room.id];
                              const availableUnits = availability?.availableUnits;
                              const soldOutForDates = !!availability && availableUnits <= 0;
                              return (
                            <SelectItem 
                              key={room.id} 
                              value={room.id}
                              disabled={!room.available || soldOutForDates}
                              className="text-gray-900 font-medium focus:bg-amber-100 focus:text-gray-900"
                            >
                              {room.name} - R{(room.priceNumeric || 0).toLocaleString()} per night
                              {availability
                                ? soldOutForDates
                                  ? " (Sold out for selected dates)"
                                  : ` (${availableUnits} left)`
                                : ` (${room.totalUnits || 1} total)`}
                            </SelectItem>
                              );
                            })()
                          ))}
                        </SelectContent>
                      </Select>
                      {isRoomsLoading && (
                        <p className="text-sm text-gray-500 mt-2">Loading room types...</p>
                      )}
                      {checkIn && checkOut && isAvailabilityLoading && (
                        <p className="text-sm text-gray-500 mt-2">Checking availability...</p>
                      )}
                      {selectedRoomAvailability && selectedRoomAvailability.availableUnits > 0 && (
                        <p className="text-sm text-emerald-700 mt-2">
                          {selectedRoomAvailability.availableUnits} of {selectedRoomAvailability.totalUnits} unit(s) available for selected dates.
                        </p>
                      )}
                      {selectedRoom && (!selectedRoom.available || (selectedRoomAvailability?.availableUnits ?? 1) <= 0) && (
                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" aria-hidden={true} /> This room type is currently fully booked for selected dates
                        </p>
                      )}
                    </div>

                    {/* Guests */}
                    <div>
                      <Label htmlFor="guests" className="text-gray-900 font-semibold">Number of Guests</Label>
                      <Input
                        id="guests"
                        type="number"
                        min={1}
                        value={guests}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/[^\d]/g, "");
                          setGuests(digitsOnly);
                        }}
                        className="mt-2 bg-white text-gray-900 font-medium border-gray-300 border-2 placeholder:text-gray-400 focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                        placeholder="Enter number of guests"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Guest Details */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl mb-6 text-gray-900 font-semibold">Guest Information</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-gray-900 font-semibold">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="mt-2 bg-white text-gray-900 font-medium border-gray-300 border-2 placeholder:text-gray-400 focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-gray-900 font-semibold">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="mt-2 bg-white text-gray-900 font-medium border-gray-300 border-2 placeholder:text-gray-400 focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-900 font-semibold">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 bg-white text-gray-900 font-medium border-gray-300 border-2 placeholder:text-gray-400 focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                        placeholder="john.doe@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-gray-900 font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+27 123 456 7890"
                        className="mt-2 bg-white text-gray-900 font-medium border-gray-300 border-2 placeholder:text-gray-400 focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="requests" className="text-gray-900 font-semibold">Special Requests (Optional)</Label>
                      <textarea
                        id="requests"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full mt-2 p-3 bg-white text-gray-900 font-medium border border-gray-300 border-2 rounded-md min-h-[100px] placeholder:text-gray-400 focus:border-amber-600 focus:ring-amber-600 focus:ring-2"
                        placeholder="Any special requirements or preferences..."
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div className="space-y-6">
                    {!user && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900 mb-1">Sign In Required</p>
                          <p className="text-sm text-amber-800">
                            You must sign in to complete your booking. Your booking details will be saved to your account.
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl mb-2 text-gray-900 font-semibold">Secure Payment</h2>
                      <p className="text-sm text-gray-700">
                        Complete your booking with a secure Yoco payment
                      </p>
                    </div>

                    <YocoPaymentForm
                      amount={totalAmount}
                      email={email}
                      firstName={firstName}
                      lastName={lastName}
                      isProcessing={isProcessing}
                      onCheckoutCreated={(checkoutId) => {
                        savePendingBookingDraft();
                        sessionStorage.setItem(PENDING_CHECKOUT_ID_KEY, checkoutId);
                      }}
                      onError={(error) => {
                        toast.error(error);
                      }}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8 pt-6 border-t">
                  {step > 1 && step < 3 && (
                    <Button
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button
                      onClick={handleNextStep}
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="flex-1"
                    >
                      Back to Details
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 lg:max-w-md xl:max-w-none">
                <h3 className="text-xl mb-4 text-gray-900 font-semibold">Booking Summary</h3>
                
                {selectedRoom && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Room</p>
                      <p className="font-semibold text-gray-900">{selectedRoom.name}</p>
                    </div>

                    {checkIn && checkOut && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Check-in</p>
                          <p className="font-semibold text-gray-900">{format(checkIn, "PPP")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Check-out</p>
                          <p className="font-semibold text-gray-900">{format(checkOut, "PPP")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Nights</p>
                          <p className="font-semibold text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</p>
                        </div>
                      </>
                    )}

                    <div>
                      <p className="text-sm text-gray-600">Guests</p>
                      <p className="font-semibold text-gray-900">{guests} guest{guests !== '1' ? 's' : ''}</p>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 text-sm">Room rate</span>
                        <span className="font-medium text-gray-900">R{(selectedRoom.priceNumeric || 0).toLocaleString()} x {nights}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 text-sm">Subtotal</span>
                        <span className="font-medium text-gray-900">R{totalPrice.toLocaleString()}</span>
                      </div>
                      {/* <div className="flex justify-between mb-2">
                        <span className="text-gray-600 text-sm">Taxes & fees</span>
                        <span className="font-medium text-gray-900">R{taxesAndFees.toLocaleString()}</span>
                      </div> */}
                      <div className="pt-4 border-t flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-2xl text-amber-600 font-bold">
                          R{totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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
                <p className="text-gray-200">Your reservation has been successfully confirmed.</p>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Booking Reference</p>
                  <p className="text-2xl font-mono font-semibold text-amber-400">{bookingReference}</p>
                </div>
                <p className="text-sm text-gray-300">
                  A confirmation email has been sent to <span className="text-white font-medium">{email}</span>
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
