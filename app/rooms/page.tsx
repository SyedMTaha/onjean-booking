import { Metadata } from "next";
import { Navigation } from "@/components/Navbar";
import { RoomsClient } from "@/components/pages/roomsPage";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Luxury Rooms - 78 On Jean",
  description: "Explore our collection of beautifully designed luxury rooms and suites.",
};

export default function RoomsPage() {
  return (
    <>
      <Navigation />
      <RoomsClient />
      <Footer />
    </>
  );
}
