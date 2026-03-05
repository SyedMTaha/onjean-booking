"use client";

import { Navigation } from "@/components/Navbar";
import { CartPage } from "@/components/pages/cartPage";
import { Footer } from "@/components/Footer";

export default function Page() {
   return (
      <>
        <Navigation />
        <CartPage />
        <Footer />
      </>
    );
}
