import { Metadata } from "next";
import { Navigation } from "@/components/Navbar";
import { GalleryClient } from "@/components/pages/galleryPage";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Gallery - 78 On Jean",
  description: "Browse our gallery of beautiful hotel spaces and amenities.",
};

export default function GalleryPage({ params }: { params: { locale: string } }) {
  return (
    <>
      <Navigation />
      <GalleryClient />
      <Footer />
    </>
  );
}
