"use client";

import Image from "next/image";

export default function SlideShow() {
  const logos = [
    "/logos/LOGOKAFE-01.png",
    "/logos/LOGOKAFE-02.png",
    "/logos/LOGOKAFE-03.png",
    "/logos/LOGOKAFE-04.png",
    "/logos/LOGOKAFE-05.png",
    "/logos/LOGOKAFE-06.png",
    "/logos/LOGOKAFE-07.png",
    "/logos/LOGOKAFE-08.png",
  ];

  return (
    <footer className="overflow-hidden py-6 bg-[#201804] border-t border-[#3a2e10]">
      <div className="flex gap-10 w-max animate-scroll-left-loop">
        {[...logos, ...logos].map((logo, idx) => (
          <Image
            key={idx}
            src={logo}
            alt="logo"
            width={70}
            height={30}
            className="opacity-90 hover:opacity-100 transition"
          />
        ))}
      </div>
    </footer>
  );
}
