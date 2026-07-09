"use client";

export default function NavbarMitra({ title }: { title: string }) {
  return (
    <nav className="flex justify-between items-center px-8 py-7 bg-[#201804] text-white border-b border-[#3a2e10]">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm opacity-80">Mitra Panel</span>
      </div>
    </nav>
  );
}
