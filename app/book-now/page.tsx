import { Metadata } from "next";
import { Navigation } from "@/components/Navbar";
import { BookingClient } from "@/components/pages/bookNowPage";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Book Your Stay - 78 On Jean",
  description: "Complete your hotel reservation in 3 easy steps.",
};

export default function BookingPage() {
  return (
  <>
  <Navigation />
  <BookingClient />
  <Footer />
  </>
  );
}
