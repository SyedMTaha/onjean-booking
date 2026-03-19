"use client";

import { Navigation } from "@/components/Navbar";
import { OrderPage } from "@/components/pages/myordersPage";
import { Footer } from "@/components/Footer";

export default function Page({ params }: { params: { locale: string } }) {
   return (
      <>
        <Navigation />
        <OrderPage />
        <Footer />
      </>
    );
}
