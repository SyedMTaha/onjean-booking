import { Metadata } from "next";
import { BookingClient } from "@/components/pages/bookingPage";

export const metadata: Metadata = {
  title: "Book Your Stay - 78 On Jean",
  description: "Complete your hotel reservation in 3 easy steps.",
};

export default function BookingPage() {
  return <BookingClient />;
}
