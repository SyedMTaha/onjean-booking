export interface Room {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
  images?: string[];
  maxGuests: number;
  bedType: string;
  size: string;
  description: string;
  longDescription?: string;
  amenities: string[];
  features?: string[];
  view?: string;
  category?: string;
}

export const rooms: Room[] = [
  {
    id: "1",
    name: "Family Double Room",
    slug: "family-double-room-1",
    category: "Family Room",
    price: "R2,500",
    image: "/rooms/r1-family/family-3.jpg",
    images: [
      ...Array.from({ length: 13 }, (_, i) => `/rooms/r1-family/family-${i + 1}.jpg`)
    ],
    maxGuests: 4,
    bedType: "2 Double Beds",
    size: "35 m²",
    description: "Spacious Family Room with 2 double beds, private bathroom, and garden views.",
    amenities: ["Garden View", "Streaming TV", "Tea/Coffee Maker", "Minibar", "Private Bathroom", "No Smoking"],
    features: ["Free Toiletries", "Shower", "Toilet", "Towels", "Hairdryer", "Streaming Service", "TV", "Refrigerator", "Tea/Coffee Maker", "Fan", "Minibar", "Electric Kettle", "Wardrobe or Closet", "Clothes Rack", "No Smoking"]
  },
  {
    id: "2",
    name: "Deluxe Double Room with Bath",
    slug: "deluxe-double-room-with-bath",
    category: "Deluxe Double Room",
    price: "R2,100",
    image: "/rooms/r2-deluxe-bath/deluxe-bath-9.jpg",
    images: [
      ...Array.from({ length: 10 }, (_, i) => `/rooms/r2-deluxe-bath/deluxe-bath-${i + 1}.jpg`)
    ],
    maxGuests: 2,
    bedType: "1 Double Bed",
    size: "25 m²",
    description: "Deluxe Double Room with bath, private bathroom, minibar, coffee machine, and free WiFi.",
    amenities: ["Bath", "Private Bathroom", "Flat-screen TV", "Coffee Machine", "Minibar", "Free WiFi", "No Smoking"],
    features: ["Bath", "Free Toiletries", "Shower", "Toilet", "Towels", "Hairdryer", "Streaming Service", "TV", "Refrigerator", "Tea/Coffee Maker", "Fan", "Minibar", "Electric Kettle", "Wardrobe or Closet", "Clothes Rack", "No Smoking"]
  },
  {
    id: "3",
    name: "Deluxe Double Room",
    slug: "deluxe-double-room-3",
    category: "Deluxe Double Room",
    price: "R1,800",
    image: "/rooms/r3-deluxe/deluxe-6.jpg",
    images: [
      ...Array.from({ length: 10 }, (_, i) => `/rooms/r3-deluxe/deluxe-${i + 1}.jpg`)
    ],
    maxGuests: 2,
    bedType: "1 Double Bed",
    size: "30 m²",
    description: "Featuring free toiletries, this double room includes a private bathroom with a shower, a hairdryer and slippers. The double room features a minibar, a tea and coffee maker, a wardrobe, a flat-screen TV with streaming services, as well as garden views. The unit has 1 bed.",
    amenities: ["Garden View", "Streaming TV", "Tea/Coffee Maker", "Minibar", "Private Bathroom", "No Smoking"],
    features: ["Free Toiletries", "Shower", "Toilet", "Towels", "Hairdryer", "Streaming Service", "TV", "Refrigerator", "Tea/Coffee Maker", "Fan", "Minibar", "Electric Kettle", "Wardrobe or Closet", "Clothes Rack", "No Smoking"]
  },
  {
    id: "4",
    name: "Family Double Room",
    slug: "family-double-room-4",
    category: "Family Room",
    price: "R2,500",
    image: "/rooms/r4-family/family-16.jpg",
    images: [
      ...Array.from({ length: 18 }, (_, i) => `/rooms/r4-family/family-${i + 1}.jpg`)
    ],
    maxGuests: 4,
    bedType: "2 Double Beds",
    size: "35 m²",
    description: "Spacious Family Room with 2 double beds, private bathroom, and garden views.",
    amenities: ["Garden View", "Streaming TV", "Tea/Coffee Maker", "Minibar", "Private Bathroom", "No Smoking"],
    features: ["Free Toiletries", "Shower", "Toilet", "Towels", "Hairdryer", "Streaming Service", "TV", "Refrigerator", "Tea/Coffee Maker", "Fan", "Minibar", "Electric Kettle", "Wardrobe or Closet", "Clothes Rack", "No Smoking"]
  },
  {
    id: "5",
    name: "Deluxe Double Room",
    slug: "deluxe-double-room-5",
    category: "Deluxe Double Room",
    price: "R1,800",
    image: "/rooms/r5-deluxe/deluxe-1.jpg",
    images: [
      ...Array.from({ length: 5 }, (_, i) => `/rooms/r5-deluxe/deluxe-${i + 1}.jpg`)
    ],
    maxGuests: 2,
    bedType: "1 Double Bed",
    size: "30 m²",
    description: "Comfy Deluxe Double Room with 1 double bed, private bathroom, and garden views.",
    amenities: ["Garden View", "Streaming TV", "Tea/Coffee Maker", "Minibar", "Private Bathroom", "No Smoking"],
    features: ["Free Toiletries", "Shower", "Toilet", "Towels", "Hairdryer", "Streaming Service", "TV", "Refrigerator", "Tea/Coffee Maker", "Fan", "Minibar", "Electric Kettle", "Wardrobe or Closet", "Clothes Rack", "No Smoking"]
  },
  {
    id: "6",
    name: "Deluxe Double Room",
    slug: "deluxe-double-room-6",
    category: "Deluxe Double Room",
    price: "R1,800",
    image: "/rooms/r6-DELUXE/deluxe-1.jpg",
    images: [
      ...Array.from({ length: 7 }, (_, i) => `/rooms/r6-DELUXE/deluxe-${i + 1}.jpg`)
    ],
    maxGuests: 2,
    bedType: "1 Double Bed",
    size: "30 m²",
    description: "Comfy Deluxe Double Room with 1 double bed, private bathroom, and garden views.",
    amenities: ["Garden View", "Streaming TV", "Tea/Coffee Maker", "Minibar", "Private Bathroom", "No Smoking"],
    features: ["Free Toiletries", "Shower", "Toilet", "Towels", "Hairdryer", "Streaming Service", "TV", "Refrigerator", "Tea/Coffee Maker", "Fan", "Minibar", "Electric Kettle", "Wardrobe or Closet", "Clothes Rack", "No Smoking"]
  },
  {
    id: "7",
    name: "Deluxe Double Room",
    slug: "deluxe-double-room-7",
    category: "Deluxe Double Room",
    price: "R1,800",
    image: "/rooms/r7-DELUXE/deluxe-2.jpg",
    images: [
      "/rooms/r7-DELUXE/deluxe-1.jpg",
      "/rooms/r7-DELUXE/deluxe-2.jpg"
    ],
    maxGuests: 2,
    bedType: "1 Double Bed",
    size: "30 m²",
    description: "Comfy Deluxe Double Room with 1 double bed, private bathroom, and garden views.",
    amenities: ["Garden View", "Streaming TV", "Tea/Coffee Maker", "Minibar", "Private Bathroom", "No Smoking"],
    features: ["Free Toiletries", "Shower", "Toilet", "Towels", "Hairdryer", "Streaming Service", "TV", "Refrigerator", "Tea/Coffee Maker", "Fan", "Minibar", "Electric Kettle", "Wardrobe or Closet", "Clothes Rack", "No Smoking"]
  },
  ];


export function getRoomBySlug(slug: string): Room | undefined {
  return rooms.find(room => room.slug === slug);
}

export function getAllRoomSlugs(): string[] {
  return rooms.map(room => room.slug);
}
