"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Montserrat, Playfair_Display } from "next/font/google";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { SignInModal } from "./auth/SignInModal";
import { SignUpModal } from "./auth/SignUpModal";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/rooms", label: "Rooms" },
    { path: "/booking", label: "Book Now" },
    { path: "/spa", label: "Spa" },
    { path: "/menu", label: "Menu" },
    { path: "/gallery", label: "Gallery" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <nav className={`${montserrat.className} sticky top-0 z-50 bg-gray-900 border-b border-gray-700 shadow-sm`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/logo/logo-2.png" 
              alt="78 On Jean Logo" 
              className="h-14 w-auto object-contain"
            />
            <div className="w-px h-8 bg-gray-700" />
            <div className="flex flex-col">
              <span className={`${playfair.className} text-lg md:text-xl font-semibold text-white leading-tight`}>
                78 ON JEAN
              </span>
              <span className="text-[8px] text-gray-400 uppercase tracking-wider">
                Boutique Hotel
              </span>
            </div>
          </Link>

          {/* Right Section - Nav Links + Auth */}
          <div className="flex items-center gap-6">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative px-4 py-2 text-sm font-medium uppercase tracking-[0.12em] transition-colors after:absolute after:left-2 after:right-2 after:-bottom-0.5 after:h-px after:bg-[linear-gradient(to_right,transparent,#9ca3af,transparent)] after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                    isActive(link.path)
                      ? "text-gray-100 after:scale-x-100"
                      : "text-gray-200 hover:text-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-200 hover:text-white hover:bg-gray-800 uppercase"
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="max-w-28 truncate font-medium">
                      {user.displayName || "My Account"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                  <DropdownMenuLabel className="text-white font-bold">
                    {user.displayName || "My Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="text-gray-200 hover:text-white hover:bg-gray-800">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/booking" className="text-gray-200 hover:text-white hover:bg-gray-800">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem onClick={handleLogout} className="text-gray-200 hover:text-white hover:bg-gray-800">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsSignUpOpen(true)}
                  className="border-gray-400 bg-transparent text-gray-100 hover:bg-gray-800 hover:text-white uppercase"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-800 text-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-700 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-[0.12em] transition-colors ${
                  isActive(link.path)
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-700">
              {!user ? (
                <div className="flex gap-2 px-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSignInOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 border-gray-400 bg-transparent text-gray-100 hover:bg-gray-800 uppercase"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSignUpOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 border-gray-400 bg-transparent text-gray-100 hover:bg-gray-800 uppercase"
                  >
                    Sign Up
                  </Button>
                </div>
              ) : (
                <div className="px-4">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full border-gray-400 text-gray-100 hover:bg-gray-800 uppercase"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSwitchToSignUp={() => {
          setIsSignInOpen(false);
          setIsSignUpOpen(true);
        }}
      />
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToSignIn={() => {
          setIsSignUpOpen(false);
          setIsSignInOpen(true);
        }}
      />
    </nav>
  );
}
