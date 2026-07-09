"use client";

import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/SlideShow";
import CafeSection from "@/components/CafeSection";
import SlideShow from "@/components/SlideShow";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#2b210a] text-white flex flex-col justify-between overflow-hidden font-poppins">
      <Navbar />
      <HeroSection />
      <CafeSection />
      <SlideShow />
    </main>
  );
}
