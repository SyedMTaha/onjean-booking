"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { getAllRooms, Room } from '@/lib/roomService';
import { rooms as localRoomsData } from '@/data/rooms';
import { Calendar } from 'lucide-react';

export function SearchBar() {
  const t = useTranslations();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [guests, setGuests] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState<'checkIn' | 'checkOut' | null>(null);

  useEffect(() => {
    const localRooms: Room[] = [
      {
        id: 'room1',
        name: 'Deluxe Suite',
        slug: 'deluxe-suite',
        price: 'R2,500',
        priceNumeric: 2500,
        image: '/images/rooms/deluxe-suite.jpg',
        images: ['/images/rooms/deluxe-suite.jpg'],
        maxGuests: 2,
        bedType: 'King Bed',
        size: '25 m²',
        description: 'A luxurious suite with city view.',
        longDescription: 'A luxurious suite with city view and all modern amenities.',
        amenities: ['WiFi', 'Air Conditioning', 'Mini Bar'],
        features: ['Balcony', 'City View', 'Non-Smoking'],
        view: 'City',
        available: true,
        totalUnits: 3,
      },
      {
        id: 'room2',
        name: 'Standard Room',
        slug: 'standard-room',
        price: 'R1,800',
        priceNumeric: 1800,
        image: '/images/rooms/standard-room.jpg',
        images: ['/images/rooms/standard-room.jpg'],
        maxGuests: 2,
        bedType: 'Queen Bed',
        size: '20 m²',
        description: 'A comfortable room for two.',
        longDescription: 'A comfortable room for two with all basic amenities.',
        amenities: ['WiFi', 'TV'],
        features: ['Non-Smoking'],
        view: 'Garden',
        available: true,
        totalUnits: 2,
      },
      {
        id: 'room3',
        name: 'Family Suite',
        slug: 'family-suite',
        price: 'R3,200',
        priceNumeric: 3200,
        image: '/images/rooms/family-suite.jpg',
        images: ['/images/rooms/family-suite.jpg'],
        maxGuests: 4,
        bedType: '2 Double Beds',
        size: '35 m²',
        description: 'Spacious suite for families.',
        longDescription: 'Spacious suite for families with separate living area.',
        amenities: ['WiFi', 'Mini Bar', 'Kitchenette'],
        features: ['Balcony', 'Non-Smoking'],
        view: 'Pool',
        available: true,
        totalUnits: 1,
      },
      {
        id: 'room4',
        name: 'Executive Room',
        slug: 'executive-room',
        price: 'R2,800',
        priceNumeric: 2800,
        image: '/images/rooms/executive-room.jpg',
        images: ['/images/rooms/executive-room.jpg'],
        maxGuests: 2,
        bedType: 'King Bed',
        size: '28 m²',
        description: 'Premium room for business travelers.',
        longDescription: 'Premium room for business travelers with workspace.',
        amenities: ['WiFi', 'Workspace', 'Coffee Maker'],
        features: ['Non-Smoking'],
        view: 'City',
        available: true,
        totalUnits: 1,
      },
      {
        id: 'room5',
        name: 'Penthouse Suite',
        slug: 'penthouse-suite',
        price: 'R5,000',
        priceNumeric: 5000,
        image: '/images/rooms/penthouse-suite.jpg',
        images: ['/images/rooms/penthouse-suite.jpg'],
        maxGuests: 2,
        bedType: 'King Bed',
        size: '50 m²',
        description: 'Top floor suite with panoramic views.',
        longDescription: 'Top floor suite with panoramic views and luxury amenities.',
        amenities: ['WiFi', 'Jacuzzi', 'Mini Bar'],
        features: ['Balcony', 'Sea View', 'Non-Smoking'],
        view: 'Sea',
        available: true,
        totalUnits: 1,
      },
      {
        id: 'room6',
        name: 'Twin Room',
        slug: 'twin-room',
        price: 'R1,600',
        priceNumeric: 1600,
        image: '/images/rooms/twin-room.jpg',
        images: ['/images/rooms/twin-room.jpg'],
        maxGuests: 2,
        bedType: '2 Single Beds',
        size: '18 m²',
        description: 'Ideal for friends or colleagues.',
        longDescription: 'Ideal for friends or colleagues, two single beds.',
        amenities: ['WiFi', 'TV'],
        features: ['Non-Smoking'],
        view: 'Garden',
        available: true,
        totalUnits: 2,
      },
      {
        id: 'room7',
        name: 'Budget Room',
        slug: 'budget-room',
        price: 'R1,200',
        priceNumeric: 1200,
        image: '/images/rooms/budget-room.jpg',
        images: ['/images/rooms/budget-room.jpg'],
        maxGuests: 2,
        bedType: 'Double Bed',
        size: '15 m²',
        description: 'Affordable comfort for short stays.',
        longDescription: 'Affordable comfort for short stays, all essentials included.',
        amenities: ['WiFi'],
        features: ['Non-Smoking'],
        view: 'Courtyard',
        available: true,
        totalUnits: 2,
      },
    ];

    const loadRooms = async () => {
      try {
        const dbRooms = await getAllRooms();
        setRooms(dbRooms);
      } catch {
        // Map localRoomsData to add missing fields for type compatibility
        const mappedRooms = localRoomsData.map((room) => ({
          ...room,
          priceNumeric: typeof room.price === 'string' ? parseInt(room.price.replace(/\D/g, '')) : 0,
          available: true,
        }));
        setRooms(mappedRooms);
      }
    };

    loadRooms();
  }, []);

  const getNightCount = () => {
    if (dateRange.from && dateRange.to) {
      const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const handleDateSelect = (range: any) => {
    setDateRange(range || { from: undefined, to: undefined });
    // Close calendar when both dates are selected
    if (range?.from && range?.to) {
      setIsCalendarOpen(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    const selectedRoomData = rooms.find((room) => room.id === selectedRoom);

    if (selectedRoomData) {
      params.set('roomId', selectedRoomData.id);
      params.set('room', selectedRoomData.name);
    }

    if (dateRange.from) {
      params.set('checkIn', format(dateRange.from, 'yyyy-MM-dd'));
    }

    if (dateRange.to) {
      params.set('checkOut', format(dateRange.to, 'yyyy-MM-dd'));
    }

    if (guests) {
      params.set('guests', guests);
    }

    const query = params.toString();
    router.push(query ? `/book-now?${query}` : '/book-now');
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-full shadow-2xl p-3 md:p-2 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 max-w-5xl mx-auto">
      {/* Room Selection */}
      <div className="flex-1 px-4 md:px-6 py-3 md:border-r border-gray-200 min-w-0 flex flex-col justify-end">
        <label className="text-xs font-semibold text-gray-700 block mb-1">
          {t('searchBar.selectRoom')}
        </label>
        <Select value={selectedRoom} onValueChange={setSelectedRoom}>
          <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 focus:ring-offset-0 text-sm text-gray-900 bg-white">
            <SelectValue placeholder={t('searchBar.chooseRoom')} className="text-gray-900" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {rooms.map((room) => (
              <SelectItem
                key={room.id}
                value={room.id}
                className="text-gray-900 hover:bg-orange-50 focus:bg-orange-50 data-highlighted:bg-orange-50"
              >
                {room.name} - {room.price}/{t('searchBar.perNight')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Check-in Date */}
      <div className="flex-1 px-4 md:px-6 py-3 md:border-r border-gray-200 min-w-0 flex flex-col justify-end">
        <label className="text-xs font-semibold text-gray-700 block mb-1">
          {t('searchBar.checkIn')}
        </label>
        <Popover open={isCalendarOpen && activeField === 'checkIn'} onOpenChange={(open) => {
          setIsCalendarOpen(open);
          if (open) setActiveField('checkIn');
        }}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center justify-between text-left">
              <span className="text-sm text-gray-900">
                {dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : t('searchBar.selectDate')}
              </span>
              <Calendar className="h-4 w-4 text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            {dateRange.from && dateRange.to && (
              <div className="p-3 bg-gray-900 text-white text-center text-sm">
                {format(dateRange.from, "dd MMM")} - {format(dateRange.to, "dd MMM")} | {getNightCount()} {getNightCount() === 1 ? 'night' : 'nights'}
              </div>
            )}
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={handleDateSelect}
              disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              numberOfMonths={2}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Check-out Date */}
      <div className="flex-1 px-4 md:px-6 py-3 md:border-r border-gray-200 min-w-0 flex flex-col justify-end">
        <label className="text-xs font-semibold text-gray-700 block mb-1">
          {t('searchBar.checkOut')}
        </label>
        <Popover open={isCalendarOpen && activeField === 'checkOut'} onOpenChange={(open) => {
          setIsCalendarOpen(open);
          if (open) setActiveField('checkOut');
        }}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center justify-between text-left">
              <span className="text-sm text-gray-900">
                {dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : t('searchBar.selectDate')}
              </span>
              <Calendar className="h-4 w-4 text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            {dateRange.from && dateRange.to && (
              <div className="p-3 bg-gray-900 text-white text-center text-sm">
                {format(dateRange.from, "dd MMM")} - {format(dateRange.to, "dd MMM")} | {getNightCount()} {getNightCount() === 1 ? 'night' : 'nights'}
              </div>
            )}
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={handleDateSelect}
              disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              numberOfMonths={2}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Guests */}
      <div className="flex-1 px-4 md:px-6 py-3 md:border-r border-gray-200 min-w-0 flex flex-col justify-end">
        <label className="text-xs font-semibold text-gray-700 block mb-1">
          {t('searchBar.addGuests')}
        </label>
        <Input
          type="number"
          placeholder={t('searchBar.numberOfGuests')}
          min="1"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Search Button */}
      <div className="px-2">
        <Button
          onClick={handleSearch}
          className="bg-gray-900 hover:bg-black text-white rounded-full h-14 px-8 w-full md:w-auto font-semibold"
        >
          {t('searchBar.searchButton')}
        </Button>
      </div>
    </div>
  );
}