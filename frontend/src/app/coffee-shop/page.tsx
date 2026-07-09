// import CoffeeShopHeader from "@/components/CoffeeShopHeader";
// import MenuSection from "@/components/MenuSection";
// import ReviewSection from "@/components/ReviewSection";
// import { dummyCoffeeShop } from "@/data/dummyCoffeeShop";

// export default function CoffeeShopPage() {
//   const categories = Array.from(
//     new Set(dummyCoffeeShop.menus.map((m) => m.category))
//   );

//   return (
//     <main className="max-w-6xl mx-auto px-4 py-6">
//       <CoffeeShopHeader shop={dummyCoffeeShop} />
//       {categories.map((category) => (
//         <MenuSection
//           key={category}
//           title={category}
//           items={dummyCoffeeShop.menus.filter((m) => m.category === category)}
//         />
//       ))}
//       <ReviewSection />
//     </main>
//   );
// }
export default function CoffeeShopPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Coffee Shop</h1>
      <p>Halaman ini sedang dipersiapkan.</p>
    </main>
  );
}
