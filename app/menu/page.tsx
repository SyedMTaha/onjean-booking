import { Metadata } from "next";
import { MenuClient } from "@/components/pages/menuPage";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Menu - 78 On Jean",
  description: "Explore our delicious dining options.",
};

export default function MenuPage() {
  return (
    <>
      <MenuClient />
      <Footer />
    </>
  );
}
