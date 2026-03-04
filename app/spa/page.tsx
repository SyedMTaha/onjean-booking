import { Metadata } from "next";
import { SpaClient } from "@/components/pages/spaPage";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Spa & Wellness - 78 On Jean",
  description: "Experience our world-class spa and wellness treatments.",
};

export default function SpaPage() {
  return (
    <>
      <SpaClient />
      <Footer />
    </>
  );
}
