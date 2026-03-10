import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/Navbar";
import { RoomDetailClient } from "@/components/pages/roomDetailPage";
import { Footer } from "@/components/Footer";
import { getRoomBySlug as getDbRoomBySlug, getAllRooms, Room } from "@/lib/roomService";
import { getRoomBySlug as getFallbackRoomBySlug, getAllRoomSlugs, rooms as fallbackRooms } from "@/data/rooms";

interface RoomPageProps {
  params: { slug: string };
}

// Wrapper function to get room from DB with fallback
async function getRoomBySlug(slug: string): Promise<Room | null> {
  try {
    const dbRoom = await getDbRoomBySlug(slug);
    if (dbRoom) {
      return dbRoom;
    }
  } catch (error) {
    // Silently fall back to static data
    if (process.env.NODE_ENV === 'development') {
      console.info('ℹ️ Using static room data for slug:', slug);
    }
  }
  
  // Fallback to static data - transform to match DB Room type
  const fallbackRoom = getFallbackRoomBySlug(slug);
  if (fallbackRoom) {
    return {
      ...fallbackRoom,
      id: fallbackRoom.slug, // Use slug as id for fallback
      priceNumeric: parseFloat(fallbackRoom.price.replace(/[^\d.]/g, '')),
      available: true,
      totalUnits: 1,
    };
  }
  
  return null;
}

// Wrapper to get all slugs from DB with fallback
async function getAllSlugs() {
  try {
    const dbRooms = await getAllRooms();
    if (dbRooms.length > 0) {
      return dbRooms.map(room => room.slug);
    }
  } catch (error) {
    // Silently fall back to static data
  }
  
  // Fallback to static data
  return getAllRoomSlugs();
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

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
  const room = await getRoomBySlug(slug);

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
