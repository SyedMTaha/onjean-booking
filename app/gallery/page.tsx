import { Metadata } from "next";
import { GalleryClient } from "@/components/pages/galleryPage";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Gallery - 78 On Jean",
  description: "Browse our gallery of beautiful hotel spaces and amenities.",
};

export default function GalleryPage() {
  return (
    <>
      <GalleryClient />
      <Footer />
    </>
  );
}
