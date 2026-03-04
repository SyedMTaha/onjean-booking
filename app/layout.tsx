import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "78 On Jean - Luxury Hotel",
  description: "Experience luxury hospitality in the heart of South Africa",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
      >
        <AuthProvider>
          <Navigation />
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
