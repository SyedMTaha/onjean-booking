import { Metadata } from "next";
import { DashboardClient } from "@/components/pages/dashboardPage";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Dashboard - 78 On Jean",
  description: "Admin dashboard for bookings and analytics.",
};

export default function DashboardPage() {
  return (
    <>
      <DashboardClient />
      <Footer />
    </>
  );
}
