import { Metadata } from "next";
import { Navigation } from "@/components/Navbar";
import { MenuClient } from "@/components/pages/menuPage";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Menu - 78 On Jean",
  description: "Explore our delicious dining options.",
};

export default function MenuPage({ params }: { params: { locale: string } }) {
  return (
    <>
      <Navigation />
      <MenuClient />
      <Footer />
    </>
  );
}
