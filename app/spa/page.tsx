import { Metadata } from "next";
import { Navigation } from "@/components/Navbar";
import { SpaClient } from "@/components/pages/spaPage";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Spa & Wellness - 78 On Jean",
  description: "Experience our world-class spa and wellness treatments.",
};

export default function SpaPage() {
  return (
    <>
      <Navigation />
      <SpaClient />
      <Footer />
    </>
  );
}
