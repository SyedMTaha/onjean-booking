import { Metadata } from "next";
import { Navigation } from "@/components/Navbar";
import { ContactClient } from "@/components/pages/contactPage";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Us - 78 On Jean",
  description: "Get in touch with our hotel team.",
};

export default function ContactPage() {
  return (
    <>
      <Navigation />
      <ContactClient />
      <Footer />
    </>
  );
}
