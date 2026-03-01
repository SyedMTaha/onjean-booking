"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SearchBar() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const handleSearch = () => {
    router.push('/booking');
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-full shadow-2xl p-3 md:p-2 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2 max-w-5xl mx-auto">
      {/* Destination */}
      <div className="flex-1 px-4 md:px-6 py-3 md:border-r border-gray-200 min-w-0">
        <label className="text-xs font-semibold text-gray-700 block mb-1">
          Add destination
        </label>
        <Input
          type="text"
          placeholder="Where are you going?"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-400"
        />
      </div>

      {/* Check-in Date */}
      <div className="flex-1 px-4 md:px-6 py-3 md:border-r border-gray-200 min-w-0">
        <label className="text-xs font-semibold text-gray-700 block mb-1">
          Check-in
        </label>
        <div className="relative">
          <Input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
        </div>
      </div>

      {/* Check-out Date */}
      <div className="flex-1 px-4 md:px-6 py-3 md:border-r border-gray-200 min-w-0">
        <label className="text-xs font-semibold text-gray-700 block mb-1">
          Check-out
        </label>
        <div className="relative">
          <Input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="flex-1 px-4 md:px-6 py-3 md:border-r border-gray-200 min-w-0">
        <label className="text-xs font-semibold text-gray-700 block mb-1">
          Add guests
        </label>
        <Input
          type="number"
          placeholder="Number of guests"
          min="1"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-400"
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