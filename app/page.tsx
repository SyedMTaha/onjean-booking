import { HomeClient } from "@/components/pages/homePage";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "78 On Jean - Luxury Hotel Booking",
  description: "Experience luxury hospitality in the heart of South Africa. Award-winning hotel with world-class amenities.",
};

export default function Home() {
  return (
    <>
      <HomeClient />
      <Footer />
    </>
  );
}
