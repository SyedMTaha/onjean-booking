export interface Room {
  id: number;
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
}

export const rooms: Room[] = [
  {
    id: 1,
    name: "Deluxe Double Room",
    slug: "deluxe-double-room",
    price: "R1,800",
    image: "/rooms/deluxe/deluxe-1.jpg",
    images: [
      "/rooms/deluxe/deluxe-1.jpg",
      "/rooms/deluxe/deluxe-2.jpg",
      "/rooms/deluxe/deluxe-3.jpg",
      "/rooms/deluxe/deluxe-4.jpg",
      "/rooms/deluxe/deluxe-5.jpg"
    ],
    maxGuests: 2,
    bedType: "1 Double Bed",
    size: "30 m²",
    view: "Garden View",
    description: "Comfy Deluxe Double Room with 1 double bed, private bathroom, and garden views.",
    longDescription: "Featuring free toiletries, this Deluxe Double Room includes a private bathroom with a shower, hairdryer, slippers, toilet, towels, and toilet paper. The room offers a minibar, tea/coffee maker, wardrobe, refrigerator, fan, flat-screen TV with streaming services, wake-up service, electric kettle, clothes rack, and linen. Entire unit is located on the ground floor. Comfy beds rating: 7.5 (based on 1 review).",
    amenities: ["Garden View", "Streaming TV", "Tea/Coffee Maker", "Minibar", "Private Bathroom", "No Smoking"],
    features: ["Free Toiletries", "Shower", "Toilet", "Towels", "Hairdryer", "Toilet Paper", "Streaming Service", "TV", "Refrigerator", "Tea/Coffee Maker", "Flat-screen TV", "Fan", "Minibar", "Alarm Clock", "Electric Kettle", "Wardrobe or Closet", "Clothes Rack", "No Smoking"]
  },
  {
    id: 2,
    name: "Deluxe Double Room with Bath",
    slug: "deluxe-double-room-with-bath",
    price: "R2,100",
    image: "/rooms/deluxe-bath/deluxe-bath-7.jpg",
    images: [
      "/rooms/deluxe-bath/deluxe-bath-1.jpg",
      "/rooms/deluxe-bath/deluxe-bath-2.jpg",
      "/rooms/deluxe-bath/deluxe-bath-3.jpg",
      "/rooms/deluxe-bath/deluxe-bath-4.jpg",
      "/rooms/deluxe-bath/deluxe-bath-5.jpg",
      "/rooms/deluxe-bath/deluxe-bath-6.jpg",
      "/rooms/deluxe-bath/deluxe-bath-7.jpg",
      "/rooms/deluxe-bath/deluxe-bath-8.jpg",
      "/rooms/deluxe-bath/deluxe-bath-9.jpg",
      "/rooms/deluxe-bath/deluxe-bath-10.jpg"
    ],
    maxGuests: 2,
    bedType: "1 Double Bed",
    size: "25 m²",
    view: "",
    description: "25 m² Deluxe Double Room with bath, private bathroom, minibar, coffee machine, and free WiFi.",
    longDescription: "Enjoy a comfortable and stylish stay in this well-appointed double room, designed with relaxation in mind, the room offers a peaceful retreat for both business and leisure travelers.The room features a private bathroom with bath and shower, complete and a hairdryer. Guests can unwind on comfortable beds with quality linen, ensuring a restful night’s sleep.Modern conveniences include a flat-screen TV with streaming services, free WiFi, minibar, refrigerator, and tea and coffee-making facilities with an electric kettle. The room also offers a wardrobe, safe, clothes rack, and fan for added comfort.Perfect for guests looking for comfort, convenience, and a relaxing stay, this room provides everything needed for a pleasant visit.",
    amenities: ["Bath", "Private Bathroom", "Flat-screen TV", "Coffee Machine", "Minibar", "Free WiFi", "No Smoking"],
    features: ["Bath", "Free Toiletries", "Shower", "Toilet", "Towels", "Hairdryer", "Toilet Paper", "Streaming Service",  "TV", "Refrigerator",  "Tea/Coffee Maker", "Flat-screen TV", "Fan", "Minibar", "Electric Kettle", "Wake-up Service", "Wardrobe or Closet",  "Clothes Rack", "No Smoking"]
  },
  {
    id: 3,
    name: "Family Double Room",
    slug: "family-double-room",
    price: "R2,500",
    image: "/rooms/family/family-6.jpg",
    images: [
      "/rooms/family/family-1.jpg",
      "/rooms/family/family-2.jpg",
      "/rooms/family/family-3.jpg",
      "/rooms/family/family-4.jpg",
      "/rooms/family/family-5.jpg",
      "/rooms/family/family-6.jpg"
    ],
    maxGuests: 4,
    bedType: "2 Double Beds",
    size: "25 m²",
    view: "Garden View",
    description: "25 m² Family Double Room with 2 double beds, private bathroom, minibar, and free WiFi.",
    longDescription: "Providing free toiletries, this family room includes a private bathroom with a shower, hairdryer, and slippers. The room features a flat-screen TV with streaming services, minibar, tea/coffee maker, wardrobe, and fan. It also includes linen, refrigerator, electric kettle, alarm clock, clothes rack, board games/puzzles, and is located on the ground floor. Comfy beds rating: 7.5 (based on 1 review).",
    amenities: ["Private Bathroom", "Flat-screen TV", "Minibar", "Free WiFi", "Board Games/Puzzles", "No Smoking"],
    features: ["Free Toiletries", "Shower", "Toilet", "Towels", "Hairdryer", "Toilet Paper", "Streaming Service",  "TV", "Refrigerator", "Tea/Coffee Maker", "Flat-screen TV", "Fan", "Minibar", "Electric Kettle", "Wake-up Service", "Wardrobe or Closet", "Clothes Rack", "Board Games/Puzzles", "No Smoking"]
  },
  {
    id: 4,
    name: "Deluxe Double Room with Extra Bed",
    slug: "deluxe-double-room-with-extra-bed",
    price: "R3,200",
    image: "/rooms/deluxe-extra/deluxe-extra-5.jpg",
    images: [
      "/rooms/deluxe-extra/deluxe-extra-1.jpg",
      "/rooms/deluxe-extra/deluxe-extra-2.jpg",
      "/rooms/deluxe-extra/deluxe-extra-3.jpg",
      "/rooms/deluxe-extra/deluxe-extra-4.jpg",
      "/rooms/deluxe-extra/deluxe-extra-5.jpg"
    ],
    maxGuests: 5,
    bedType: "1 Single Bed ",
    size: "25 m²",
    view: "Garden View",
    description: "25 m² Deluxe Double Room with Extra Bed, private bathroom, flat-screen TV, minibar, coffee machine, and free WiFi.",
    longDescription: "Providing free toiletries, this double room includes a private bathroom with a shower, hairdryer, and slippers. The room offers a flat-screen TV with streaming services, minibar, tea/coffee maker, coffee machine, wardrobe, and fan. It also includes linen, refrigerator, electric kettle, alarm clock, clothes rack, and is located on the ground floor. Comfy beds rating: 7.5 (based on 1 review). The unit offers 3 beds.",
    amenities: ["Private Bathroom", "Flat-screen TV", "Coffee Machine", "Minibar", "Free WiFi", "No Smoking"],
    features: ["Free Toiletries", "Shower", "Toilet", "Towels", "Hairdryer",  "Toilet Paper", "Streaming Service", "TV", "Refrigerator",  "Tea/Coffee Maker", "Flat-screen TV", "Fan", "Minibar",  "Electric Kettle", "Wake-up Service", "Wardrobe or Closet",  "Clothes Rack", "No Smoking"]
  },
];

export function getRoomBySlug(slug: string): Room | undefined {
  return rooms.find(room => room.slug === slug);
}

export function getAllRoomSlugs(): string[] {
  return rooms.map(room => room.slug);
}
