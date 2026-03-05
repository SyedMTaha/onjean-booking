import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/Navbar";
import { RoomDetailClient } from "@/components/pages/roomDetailPage";
import { Footer } from "@/components/Footer";
import { getRoomBySlug, getAllRoomSlugs } from "@/data/rooms";

interface RoomPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllRoomSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoomBySlug(slug);

  if (!room) {
    return {
      title: "Room Not Found - 78 On Jean",
    };
  }

  return {
    title: `${room.name} - 78 On Jean`,
    description: room.description,
  };
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  return (
    <>
      <Navigation />
      <RoomDetailClient room={room} />
      <Footer />
    </>
  );
}
