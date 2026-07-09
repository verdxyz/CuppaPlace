"use client";
import { MenuItem } from "@/data/dummyCoffeeShop";
import MenuCard from "./MenuCard";

export default function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <section className="mb-8">
      <h2 className="font-semibold text-lg mb-3">{title}</h2>
      <div className="flex flex-wrap gap-4">
        {items.map((menu) => (
          <MenuCard key={menu.id} menu={menu} />
        ))}
      </div>
    </section>
  );
}
