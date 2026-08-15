import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { AppStoreProvider } from "@/lib/store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClickIt — rosters without the UKG headache",
  description:
    "Schedules, shift offers, clocks, and real permissions for supermarket floors. Built as a WorkJam-class alternative after the UKG Pro switch.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  );
}
