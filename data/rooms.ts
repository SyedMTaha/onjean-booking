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
    name: "Standard Room",
    slug: "standard-room",
    price: "R1,200",
    image: "https://images.unsplash.com/photo-1766928210443-0be92ed5884a?w=600&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1766928210443-0be92ed5884a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1648416405644-d74fe43f2122?w=800&h=600&fit=crop"
    ],
    maxGuests: 2,
    bedType: "1 King Bed",
    size: "25 m²",
    view: "City View",
    description: "Perfect for the budget-conscious traveler. Comfortable and well-equipped with modern amenities.",
    longDescription: "Our Standard Room offers a perfect blend of comfort and affordability. Designed with the modern traveler in mind, this room features contemporary furnishings, a comfortable king-size bed with premium linens, and all the essential amenities you need for a pleasant stay. The room's efficient layout maximizes space while maintaining a cozy atmosphere. Large windows provide natural light and city views, creating a welcoming environment to relax after a day of exploration.",
    amenities: ["WiFi", "AC", "TV", "Mini Bar", "Safe"],
    features: ["Free WiFi", "Air Conditioning", "Flat Screen TV", "Mini Bar", "In-room Safe", "Hair Dryer", "Iron & Board", "Coffee Maker"]
  },
  {
    id: 2,
    name: "Deluxe Room",
    slug: "deluxe-room",
    price: "R1,800",
    image: "https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=600&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop"
    ],
    maxGuests: 2,
    bedType: "1 King Bed",
    size: "35 m²",
    view: "Ocean View",
    description: "Upgraded comfort with stunning views. Ideal for couples seeking a luxurious experience.",
    longDescription: "Experience elevated luxury in our Deluxe Room, featuring stunning ocean views and premium amenities. This spacious room is designed for couples seeking both comfort and sophistication. The elegant décor combines modern design with classic touches, while the premium king-size bed ensures restful nights. Enjoy your morning coffee on the private seating area while taking in breathtaking ocean views. The luxurious bathroom features a deep soaking bathtub, perfect for unwinding after a day of adventures.",
    amenities: ["WiFi", "AC", "TV", "Mini Bar", "Safe", "Bathtub"],
    features: ["Free WiFi", "Air Conditioning", "Flat Screen TV", "Mini Bar", "In-room Safe", "Bathtub", "Ocean View", "Premium Bedding", "Luxury Toiletries", "Nespresso Machine"]
  },
  {
    id: 3,
    name: "Family Suite",
    slug: "family-suite",
    price: "R2,500",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop"
    ],
    maxGuests: 4,
    bedType: "2 Queen Beds",
    size: "60 m²",
    view: "Garden View",
    description: "Spacious suite perfect for families with all the comforts of home and separate living area.",
    longDescription: "Our Family Suite is thoughtfully designed to accommodate families with children, offering ample space and all the comforts of home. The suite features a separate living area with comfortable seating, perfect for family time. Two queen beds ensure everyone sleeps comfortably, while the full kitchen allows you to prepare meals at your convenience. The suite includes a dining area, work desk, and plenty of storage space. Large windows overlook our beautiful gardens, creating a peaceful retreat for the whole family.",
    amenities: ["WiFi", "AC", "TV", "Kitchen", "Safe", "Washer"],
    features: ["Free WiFi", "Air Conditioning", "2 Flat Screen TVs", "Full Kitchen", "Dining Area", "Washer/Dryer", "Living Room", "Garden View", "Work Desk", "Extra Storage"]
  },
  {
    id: 4,
    name: "Executive Suite",
    slug: "executive-suite",
    price: "R3,200",
    image: "https://images.unsplash.com/photo-1648416405644-d74fe43f2122?w=600&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1648416405644-d74fe43f2122?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop"
    ],
    maxGuests: 2,
    bedType: "1 King Bed",
    size: "45 m²",
    view: "City View",
    description: "Business and leisure combined. Perfect for the modern executive with dedicated workspace.",
    longDescription: "The Executive Suite seamlessly blends business functionality with leisure comfort, ideal for the modern professional. This sophisticated suite features a dedicated workspace with an ergonomic desk setup, high-speed WiFi, and business amenities. The separate sleeping area ensures restful nights with a plush king-size bed and blackout curtains. Unwind in the living area with premium entertainment options, or enjoy refreshments from your personal mini bar. The suite's contemporary design and premium finishes create an environment conducive to both productivity and relaxation.",
    amenities: ["WiFi", "AC", "TV", "Mini Bar", "Safe", "Workspace"],
    features: ["High-Speed WiFi", "Air Conditioning", "Smart TV", "Executive Desk", "Mini Bar", "In-room Safe", "City View", "Premium Service", "Luxury Bathroom", "Nespresso Machine", "Work Lighting"]
  },
  {
    id: 5,
    name: "Honeymoon Suite",
    slug: "honeymoon-suite",
    price: "R3,800",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop"
    ],
    maxGuests: 2,
    bedType: "1 King Luxury Bed",
    size: "50 m²",
    view: "Ocean View",
    description: "Create unforgettable memories in our romantic honeymoon suite with private jacuzzi.",
    longDescription: "Romance awaits in our exclusive Honeymoon Suite, designed to create unforgettable memories for newlyweds and couples celebrating special occasions. This intimate sanctuary features elegant romantic décor with soft lighting and luxurious fabrics. The centerpiece is a king-size luxury bed with premium Italian linens. Indulge in the private jacuzzi with ambient lighting and aromatherapy options. The suite includes a private balcony with stunning ocean views, perfect for intimate moments. Complimentary champagne upon arrival sets the tone for your romantic getaway.",
    amenities: ["WiFi", "AC", "TV", "Jacuzzi", "Mini Bar", "Safe"],
    features: ["Free WiFi", "Climate Control", "Smart TV", "Private Jacuzzi", "Premium Mini Bar", "Ocean View", "Private Balcony", "Luxury Bedding", "Romantic Lighting", "Champagne", "Rose Petals", "Aromatherapy"]
  },
  {
    id: 6,
    name: "Presidential Suite",
    slug: "presidential-suite",
    price: "R5,000",
    image: "https://images.unsplash.com/photo-1664780476492-fbb9fd277ce8?w=600&h=500&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1664780476492-fbb9fd277ce8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop"
    ],
    maxGuests: 4,
    bedType: "2 King Beds",
    size: "100 m²",
    view: "Panoramic View",
    description: "Ultimate luxury experience. The crown jewel of our hotel with panoramic views and concierge service.",
    longDescription: "Experience the pinnacle of luxury in our Presidential Suite, the crown jewel of 78 On Jean. This magnificent 100 m² suite offers unparalleled elegance and sophistication. Featuring two king-size bedrooms, a spacious living room, formal dining area, and a fully equipped kitchen, this suite can comfortably host intimate gatherings. Floor-to-ceiling windows provide breathtaking panoramic views of the city and ocean. The master bathroom features a spa-like experience with a jacuzzi, rain shower, and premium toiletries. Dedicated concierge service ensures every need is anticipated and exceeded. Perfect for distinguished guests seeking the ultimate in luxury accommodation.",
    amenities: ["WiFi", "AC", "TV", "Kitchen", "Jacuzzi", "Concierge"],
    features: ["High-Speed WiFi", "Climate Control", "Multiple Smart TVs", "Gourmet Kitchen", "Jacuzzi", "Master Bathroom", "Panoramic Views", "Private Concierge", "Living Room", "Dining Room", "Butler Service", "Premium Everything"]
  },
];

export function getRoomBySlug(slug: string): Room | undefined {
  return rooms.find(room => room.slug === slug);
}

export function getAllRoomSlugs(): string[] {
  return rooms.map(room => room.slug);
}
