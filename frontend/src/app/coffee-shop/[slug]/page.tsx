"use client";

import { useState, ChangeEvent } from "react";
import { dummyCoffeeShop } from "@/data/dummyCoffeeShop";
import Image from "next/image";
import MenuSection from "@/components/MenuSection";
import ReviewSection from "@/components/ReviewSection";
import { Star, MapPin, Clock, Bookmark, ImagePlus } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function CoffeeShopPage({ params }: { params: { slug: string } }) {
  const coffeeShop = dummyCoffeeShop;

  // STATE FORM LIVE COMMENT
  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState<string | null>(null);

  const openMaps = () => {
    window.open("https://www.google.com/maps?q=Renjana+Coffee+Semarang", "_blank");
  };

  // HANDLE UPLOAD GAMBAR
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      setCommentImage(imgUrl);
    }
  };

  // KIRIM KOMENTAR
  const handleSubmitComment = () => {
    if (!commentText) return alert("Komentar tidak boleh kosong!");

    alert("Komentar berhasil dikirim (dummy).");

    setCommentText("");
    setCommentImage(null);
  };

  return (
    <>
      <Navbar />
      <main className="bg-white text-[#271F01] min-h-screen pb-24 pt-20">
        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-6">
          
          {/* ===== BACK BUTTON ===== */}
          <button
            onClick={() => history.back()}
            className="flex items-center gap-2 text-[#271F01] text-lg font-medium mb-4 hover:underline"
          >
            ← Back
          </button>

          {/* ===== IMAGE GALLERY ===== */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <div className="md:col-span-2 lg:col-span-2">
              <Image
                src={coffeeShop.images[0]}
                alt="Main shop photo"
                width={600}
                height={400}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 col-span-3">
              {coffeeShop.images.slice(1, 5).map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  alt={`Gallery ${i}`}
                  width={200}
                  height={150}
                  className="rounded-xl w-full h-full object-cover"
                />
              ))}
            </div>
          </div>

          {/* ===== INFO SECTION ===== */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">{coffeeShop.name}</h1>

              <div className="flex flex-wrap items-center gap-4 text-[#271F01]/80 text-sm md:text-base">
                <div className="flex items-center gap-1">
                  <Star size={18} className="text-yellow-500" />
                  <span className="font-semibold">{coffeeShop.rating}/5</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={18} />
                  {coffeeShop.address}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={18} /> {coffeeShop.openHours}
                </div>
              </div>
            </div>

            <Bookmark
              size={26}
              className="text-[#271F01] mt-4 md:mt-0 cursor-pointer hover:text-yellow-600 transition"
            />
          </div>

          {/* ===== PINDAHAN: Tombol Buka Google Maps ===== */}
          <div className="mt-3 flex">
            <button
              onClick={openMaps}
              className="bg-[#271F01] text-white px-6 py-3 rounded-xl hover:bg-[#3C3110] transition flex items-center gap-2"
            >
              <MapPin size={20} /> Buka di Google Maps
            </button>
          </div>

          {/* ===== MENU SECTIONS ===== */}
          <div className="space-y-12 mt-8">
            {coffeeShop.menus?.map((m) => (
              <MenuSection key={m.category} title={m.category} items={m.items} />
            ))}
          </div>

          {/*========LIVE COMMENT + FORM INPUT========*/}

          <section className="mt-20">
            <h2 className="text-2xl font-extrabold mb-6">Live Comment</h2>

            {/* === FORM COMMENT === */}
            <div className="border border-[#E6E1D6] p-5 rounded-xl mb-6 shadow-sm">
              <h3 className="font-bold mb-2">Tulis Komentar</h3>

              <textarea
                className="w-full border border-[#D6D2C6] rounded-xl p-3 outline-none focus:border-[#271F01]"
                placeholder="Tulis komentar kamu..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />

              {/* Upload gambar */}
              <div className="mt-4 flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-[#271F01] rounded-xl hover:bg-[#EFEDE7] transition">
                  <ImagePlus size={18} />
                  Upload Foto
                  <input type="file" className="hidden" onChange={handleImageUpload} />
                </label>

                {commentImage && (
                  <Image
                    src={commentImage}
                    alt="Preview"
                    width={80}
                    height={60}
                    className="rounded-md object-cover"
                  />
                )}
              </div>

              {/* Tombol Kirim */}
              <button
                onClick={handleSubmitComment}
                className="mt-4 w-full bg-[#271F01] text-white py-3 rounded-xl hover:bg-[#3A300A] transition font-medium"
              >
                Kirim Komentar
              </button>
            </div>

            {/* === LIST LIVE COMMENTS === */}
            <div className="flex gap-5 overflow-x-auto pb-4">
              {coffeeShop.liveComments?.map((comment, i) => (
                <div
                  key={i}
                  className="min-w-[240px] bg-white border border-[#E6E1D6] rounded-2xl p-4 shadow-sm"
                >
                  <p className="text-sm font-semibold mb-2">@{comment.user}</p>
                  <p className="text-sm italic text-gray-600 mb-2">&ldquo;{comment.text}&rdquo;</p>

                  <Image
                    src={comment.image}
                    alt="comment photo"
                    width={200}
                    height={140}
                    className="rounded-xl object-cover"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ===== REVIEWS SECTION ===== */}
          <section className="mt-16">
            <h2 className="text-2xl font-extrabold mb-6">Ulasan</h2>
            <ReviewSection reviews={coffeeShop.reviews} />
          </section>
        </div>
      </main>
    </>
  );
}
