import { Metadata } from "next";
import { BookingClient } from "@/components/pages/bookingPage";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Book Your Stay - 78 On Jean",
  description: "Complete your hotel reservation in 3 easy steps.",
};

export default function BookingPage() {
  return (
  <>
  <BookingClient />
  <Footer />
  </>
  );
}
