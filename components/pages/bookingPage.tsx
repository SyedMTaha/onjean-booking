"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarIcon, CreditCard, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const roomTypes = [
  { id: 1, name: "Standard Room", price: 1200, available: true },
  { id: 2, name: "Deluxe Room", price: 1800, available: false },
  { id: 3, name: "Family Suite", price: 2500, available: true },
  { id: 4, name: "Executive Suite", price: 3200, available: true },
  { id: 5, name: "Honeymoon Suite", price: 3800, available: false },
  { id: 6, name: "Presidential Suite", price: 5000, available: true },
  { id: 7, name: "Garden View Room", price: 1500, available: true },
];

const bookedDates = [
  new Date(2026, 1, 28),
  new Date(2026, 1, 29),
  new Date(2026, 2, 1),
  new Date(2026, 2, 5),
  new Date(2026, 2, 6),
  new Date(2026, 2, 7),
];

export function BookingClient() {
  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [guests, setGuests] = useState("2");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingReference, setBookingReference] = useState("");

  const selectedRoom = roomTypes.find(r => r.id.toString() === selectedRoomType);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();
  const totalPrice = selectedRoom ? selectedRoom.price * nights : 0;

  const handleNextStep = () => {
    if (step === 1) {
      if (!checkIn || !checkOut || !selectedRoomType || !guests) {
        toast.error("Please fill in all booking details");
        return;
      }
      if (checkIn >= checkOut) {
        toast.error("Check-out date must be after check-in date");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!firstName || !lastName || !email || !phone) {
        toast.error("Please fill in all guest details");
        return;
      }
      setStep(3);
    }
  };

  const handlePayment = () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      toast.error("Please fill in all payment details");
      return;
    }

    const reference = "SL" + Math.random().toString(36).substr(2, 9).toUpperCase();
    setBookingReference(reference);
    setShowConfirmation(true);
    toast.success("Booking confirmed! Check your email for details.");
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-3 md:mb-4">Book Your Stay</h1>
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
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                {/* Step 1: Dates & Room */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl mb-6">Select Dates & Room</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Check-in */}
                      <div>
                        <Label htmlFor="checkin">Check-in Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left mt-2"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkIn ? format(checkIn, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={checkIn}
                              onSelect={setCheckIn}
                              disabled={(date) => {
                                if (date < new Date()) return true;
                                return bookedDates.some(
                                  bookedDate => bookedDate.toDateString() === date.toDateString()
                                );
                              }}
                              modifiers={{
                                booked: bookedDates
                              }}
                              modifiersStyles={{
                                booked: {
                                  textDecoration: 'line-through',
                                  color: '#ef4444',
                                  opacity: 0.5
                                }
                              }}
                            />
                            <div className="p-3 border-t bg-gray-50">
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                                  <span>Selected</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                  <span className="line-through text-red-600">Fully Booked</span>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Check-out */}
                      <div>
                        <Label htmlFor="checkout">Check-out Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left mt-2"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkOut ? format(checkOut, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={checkOut}
                              onSelect={setCheckOut}
                              disabled={(date) => {
                                if (date <= (checkIn || new Date())) return true;
                                return bookedDates.some(
                                  bookedDate => bookedDate.toDateString() === date.toDateString()
                                );
                              }}
                              modifiers={{
                                booked: bookedDates
                              }}
                              modifiersStyles={{
                                booked: {
                                  textDecoration: 'line-through',
                                  color: '#ef4444',
                                  opacity: 0.5
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Room Type */}
                    <div>
                      <Label htmlFor="room">Room Type</Label>
                      <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((room) => (
                            <SelectItem 
                              key={room.id} 
                              value={room.id.toString()}
                              disabled={!room.available}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={!room.available ? "text-gray-400" : ""}>
                                  {room.name} - R{room.price.toLocaleString()} per night
                                </span>
                                {!room.available && (
                                  <span className="ml-4 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                    Fully Booked
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedRoom && !selectedRoom.available && (
                        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                          <span>⚠️</span> This room type is currently fully booked for selected dates
                        </p>
                      )}
                    </div>

                    {/* Guests */}
                    <div>
                      <Label htmlFor="guests">Number of Guests</Label>
                      <Select value={guests} onValueChange={setGuests}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Guest</SelectItem>
                          <SelectItem value="2">2 Guests</SelectItem>
                          <SelectItem value="3">3 Guests</SelectItem>
                          <SelectItem value="4">4 Guests</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 2: Guest Details */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl mb-6">Guest Information</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+27"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="requests">Special Requests (Optional)</Label>
                      <textarea
                        id="requests"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full mt-2 p-3 border rounded-md min-h-[100px]"
                        placeholder="Any special requirements..."
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl mb-2">Payment Details</h2>
                      <p className="text-sm text-gray-600">
                        This is a demo. Use any test card details.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-blue-900 mb-1">Stripe Integration Ready</p>
                          <p className="text-blue-700">
                            Connect your Stripe account to accept real payments. For demo purposes, any card details will work.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="mt-2"
                        maxLength={19}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="MM/YY"
                          className="mt-2"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                          className="mt-2"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8 pt-6 border-t">
                  {step > 1 && (
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
                      onClick={handlePayment}
                      className="flex-1 bg-amber-600 hover:bg-amber-700"
                    >
                      Complete Booking
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h3 className="text-xl mb-4">Booking Summary</h3>
                
                {selectedRoom && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Room</p>
                      <p className="font-medium">{selectedRoom.name}</p>
                    </div>

                    {checkIn && checkOut && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Check-in</p>
                          <p className="font-medium">{format(checkIn, "PPP")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Check-out</p>
                          <p className="font-medium">{format(checkOut, "PPP")}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Nights</p>
                          <p className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</p>
                        </div>
                      </>
                    )}

                    <div>
                      <p className="text-sm text-gray-600">Guests</p>
                      <p className="font-medium">{guests} guest{guests !== '1' ? 's' : ''}</p>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Room rate</span>
                        <span>R{selectedRoom.price.toLocaleString()} x {nights}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span>R{totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Taxes & fees</span>
                        <span>R{Math.round(totalPrice * 0.15).toLocaleString()}</span>
                      </div>
                      <div className="pt-4 border-t flex justify-between items-center">
                        <span className="text-lg">Total</span>
                        <span className="text-2xl text-amber-600">
                          R{(totalPrice + Math.round(totalPrice * 0.15)).toLocaleString()}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              <div className="space-y-4 mt-4">
                <p>Your reservation has been successfully confirmed.</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
                  <p className="text-xl font-mono text-gray-900">{bookingReference}</p>
                </div>
                <p className="text-sm text-gray-600">
                  A confirmation email has been sent to {email}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              setShowConfirmation(false);
              window.location.href = "/";
            }}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            Back to Home
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
