"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from "lucide-react";

export function Footer() {
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/rooms", label: "Rooms" },
    { path: "/booking", label: "Book Now" },
    { path: "/spa", label: "Spa" },
    { path: "/menu", label: "Menu" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="mb-4">
              <img 
                src="/logo/logo-2.png" 
                alt="78 On Jean Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400">
              Experience luxury hospitality in the heart of South Africa
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://www.instagram.com/78onjean" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/78onjean" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@78onjean" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link href={link.path} className="hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
                <span className="whitespace-nowrap">78 Jean Avenue, Doringkloof, Centurion</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <a href="tel:0120066778" className="hover:text-amber-400">
                  012 006 6778
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <a href="tel:0760538540" className="hover:text-amber-400">
                  076 053 8540
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <a href="mailto:info@78onjean.co.za" className="hover:text-amber-400">
                  info@78onjean.co.za
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <a href="mailto:bookings@78onjean.co.za" className="hover:text-amber-400">
                  bookings@78onjean.co.za
                </a>
              </li>
            </ul>
          </div>

          {/* Hours - Commented Out */}
          {/* 
          <div>
            <h4 className="font-semibold mb-4">Opening Hours</h4>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li>Mon - Sun: 24/7 Open</li>
              <li>Check-in: 2:00 PM</li>
              <li>Check-out: 11:00 AM</li>
            </ul>
          </div>
          */}
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-6 pt-4 text-center text-gray-400">
          <p>&copy; 2026 78 On Jean. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
