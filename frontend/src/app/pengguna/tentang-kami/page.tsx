"use client";

import Image from "next/image";
import {
  Megaphone,
  Store,
  BarChart3,
  MapPin,
  MessageCircle,
} from "lucide-react";

// 🔹 Import Navbar dan Slideshow kamu
import Navbar from "@/components/Navbar";
import Slideshow from "@/components/SlideShow";

export default function TentangKamiPage() {
  return (
    <main className="bg-white text-[#271F01]">
      {/* ======= Navbar ======= */}
      <Navbar />

      {/* ======= Section 1: Tentang Kami ======= */}
      <section className="max-w-6xl mx-auto px-6 md:px-16 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Gambar ilustrasi */}
          <div className="flex justify-center">
            <Image
              src="/img/tentang-kami/AnakMuda.png"
              alt="Anak muda di coffeeshop"
              width={500}
              height={400}
              className="rounded-lg"
            />
          </div>

          {/* Teks deskripsi */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              CuppaPlace
            </h2>
            <p className="leading-relaxed text-lg">
              CuppaPlace lahir dari kebiasaan kami yang suka ngopi dan
              mengerjakan tugas di coffeeshop mencari suasana yang mendukung
              pekerjaan kami dan bisa saling komunikasi. Kami ingin membuat cara
              mudah bagi siapa pun untuk menemukan tempat ngopi yang sesuai mood
              dan keperluan, lengkap dengan fasilitas dan suasananya.
            </p>
          </div>
        </div>
      </section>

      {/* ======= Section 2: Apa yang Kami Tawarkan ======= */}
      <section className="max-w-6xl mx-auto px-6 md:px-16 py-10 text-center">
        <h2 className="text-3xl font-extrabold mb-2">Apa yang Kami Tawarkan</h2>
        <div className="h-1 w-16 bg-[#271F01] mx-auto mb-10 rounded"></div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left mt-0">
          {[
            {
              icon: Megaphone,
              title: "Promosi Terarah",
              text: "Kelola profil dan data kedai dengan mudah, langsung dari dashboard Anda.",
            },
            {
              icon: Store,
              title: "Manajemen Mandiri",
              text: "Kelola informasi kedai secara fleksibel dan efisien.",
            },
            {
              icon: BarChart3,
              title: "Insight Pengunjung",
              text: "Dapatkan analisis tren dan jam ramai pengunjung.",
            },
            {
              icon: MapPin,
              title: "Rekomendasi Tempat",
              text: "Temukan tempat ngopi sesuai suasana dan kebutuhan Anda.",
            },
            {
              icon: MessageCircle,
              title: "Ulasan & Komentar",
              text: "Bagikan pengalaman langsung dan beri penilaian tempat favorit.",
            },
            {
              icon: MessageCircle,
              title: "Eksplorasi Mudah",
              text: "Temukan tempat ngopi baru dengan fitur pencarian yang intuitif.",
            },
          ].map(({ icon: Icon, title, text }, index) => (
            <div
              key={index}
              className="flex items-center gap-5 p-6 rounded-xl hover:shadow-md transition w-full"
            >
              <div className="flex-shrink-0 p-4">
                <Icon size={60} strokeWidth={1.5} className="text-[#271F01]" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{title}</h3>
                <p className="text-sm leading-snug">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======= Section 3: Hubungi Kami ======= */}
      <section className="bg-[#271F01] text-white py-16 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Kontak */}
          <div>
            <h2 className="text-2xl font-extrabold mb-6">Hubungi Kami</h2>

            <div className="mb-6">
              <h3 className="font-semibold text-lg">Kontak</h3>
              <p>Phone: +62 878 3981 9622</p>
              <p>Email: cuppaplace@gmail.com</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Social Media</h3>
              <p>Instagram: @cuppaplaceofficial</p>
              <p>Facebook: CuppaPlace</p>
            </div>
          </div>

          {/* Form pertanyaan */}
          <div>
            <h2 className="text-2xl font-extrabold mb-6">Ada Pertanyaan?</h2>

            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nama"
                  className="w-full px-4 py-3 rounded-xl bg-white text-[#271F01] focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-xl bg-white text-[#271F01] focus:outline-none"
                />
              </div>
              <textarea
                placeholder="Pesan"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white text-[#271F01] focus:outline-none"
              ></textarea>

              <div className="flex gap-4">
                <button
                  type="button"
                  className="bg-white text-[#271F01] px-6 py-3 rounded-xl hover:bg-[#E8E6E1] transition"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="bg-white text-[#271F01] px-6 py-3 rounded-xl font-semibold hover:bg-[#E8E6E1] transition"
                >
                  Kirim Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

            {/* ======= Slideshow ======= */}
      <section>
        <Slideshow />
      </section>
    </main>
  );
}
