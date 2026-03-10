import { Metadata } from "next";
import { Navigation } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MyBookingsPage } from "@/components/pages/myBookingsPage";

export const metadata: Metadata = {
  title: "My Bookings - 78 On Jean",
  description: "View your room bookings and status updates.",
};

export default function BookingHistoryPage({ params }: { params: { locale: string } }) {
  return (
    <>
      <Navigation />
      <MyBookingsPage />
      <Footer />
    </>
  );
}
