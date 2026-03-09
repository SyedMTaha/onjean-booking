"use client";

import { useEffect, useState } from 'react';
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
import { Calendar } from 'lucide-react';

export function SearchBar() {
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
    const loadRooms = async () => {
      try {
        const dbRooms = await getAllRooms();
        setRooms(dbRooms.filter((room) => room.available));
      } catch {
        setRooms([]);
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

    const selectedRoomData = rooms.find((room) => room.slug === selectedRoom);

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
          Select Room
        </label>
        <Select value={selectedRoom} onValueChange={setSelectedRoom}>
          <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 focus:ring-offset-0 text-sm text-gray-900 bg-white">
            <SelectValue placeholder="Choose a room" className="text-gray-900" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {rooms.map((room) => (
              <SelectItem
                key={room.id}
                value={room.slug}
                className="text-gray-900 hover:bg-orange-50 focus:bg-orange-50 data-highlighted:bg-orange-50"
              >
                {room.name} - {room.price}/night
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Check-in Date */}
      <div className="flex-1 px-4 md:px-6 py-3 md:border-r border-gray-200 min-w-0 flex flex-col justify-end">
        <label className="text-xs font-semibold text-gray-700 block mb-1">
          Check-in
        </label>
        <Popover open={isCalendarOpen && activeField === 'checkIn'} onOpenChange={(open) => {
          setIsCalendarOpen(open);
          if (open) setActiveField('checkIn');
        }}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center justify-between text-left">
              <span className="text-sm text-gray-900">
                {dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : "Select date"}
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
          Check-out
        </label>
        <Popover open={isCalendarOpen && activeField === 'checkOut'} onOpenChange={(open) => {
          setIsCalendarOpen(open);
          if (open) setActiveField('checkOut');
        }}>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center justify-between text-left">
              <span className="text-sm text-gray-900">
                {dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : "Select date"}
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
          Add guests
        </label>
        <Input
          type="number"
          placeholder="Number of guests"
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
          Search
        </Button>
      </div>
    </div>
  );
}