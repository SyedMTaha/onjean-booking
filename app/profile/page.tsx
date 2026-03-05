import { Metadata } from "next";
import { Navigation } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProfilePage as ProfilePageContent } from "@/components/pages/profilePage";

export const metadata: Metadata = {
  title: "My Profile - 78 On Jean",
  description: "Manage your profile and bookings.",
};

export default function ProfilePage() {
  return (
    <>
      <Navigation />
      <ProfilePageContent />
      <Footer />
    </>
  );
}
