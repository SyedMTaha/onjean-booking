"use client";

import { Navigation } from "@/components/Navbar";
import { CartPage } from "@/components/pages/cartPage";
import { Footer } from "@/components/Footer";

export default function Page({ params }: { params: { locale: string } }) {
   return (
      <>
        <Navigation />
        <CartPage />
        <Footer />
      </>
    );
}
