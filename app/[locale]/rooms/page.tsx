import RoomsClient from "@/components/pages/roomsPage";
import { Metadata } from "next";
import { Navigation } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Luxury Rooms - 78 On Jean",
  description: "Explore our collection of beautifully designed luxury rooms and suites.",
};

export default async function RoomsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <Navigation />
      <RoomsClient locale={locale} />
      <Footer />
    </>
  );
}
