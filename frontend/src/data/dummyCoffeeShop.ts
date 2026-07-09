// src/data/dummyCoffeeShop.ts
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface CoffeeShop {
  name: string;
  address: string;
  rating: number;
  openHours: string;
  images: string[];
  menus: {
    category: string;
    items: MenuItem[];
  }[];
  liveComments?: {
    user: string;
    text: string;
    image: string;
  }[];
  reviews: {
    id: number;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export const dummyCoffeeShop: CoffeeShop = {
  name: "Renjana Coffee",
  address:
    "Jl. Depot, Kembangan Kidul, Kembangan Tengah, Kota Semarang, Jawa Tengah",
  rating: 5,
  openHours: "SENIN–MINGGU JAM 10.00–02.00",
  images: [
    "/img/renjana/1.jpg",
    "/img/renjana/2.jpg",
    "/img/renjana/3.jpg",
    "/img/renjana/4.jpg",
  ],
  menus: [
    {
      category: "Classic Coffee",
      items: [
        { id: "1", name: "Americano", price: 18000, image: "/menu/americano.png" },
        { id: "2", name: "Long Black", price: 18000, image: "/menu/longblack.png" },
        { id: "3", name: "Mocha", price: 18000, image: "/menu/kopsu.png" },
      ],
    },
    {
      category: "Espresso Based",
      items: [
        { id: "4", name: "Brulle Latte", price: 18000, image: "/menu/latte.png" },
        { id: "5", name: "Flavored Coffee", price: 18000, image: "/menu/pistacio.png" },
      ],
    },
    {
      category: "Coffee Mocktail",
      items: [
        { id: "6", name: "Maracuja", price: 18000, image: "/menu/tropical.png" },
      ],
    },
  ],
  liveComments: [
    {
      user: "Rani",
      text: "Lagi sepii nii coffeeshop nya!",
      image: "/img/renjana/3.jpg",
    },
    {
      user: "Bimo",
      text: "Sepii sinii ngopi☕",
      image: "/img/renjana/2.jpg",
    },
  ],
  reviews: [
    {
      id: 1,
      author: "Ziven",
      rating: 5,
      comment: "Tempatnya cozy banget dan kopinya enak!",
      date: "2025-10-10",
    },
    {
      id: 2,
      author: "Rani",
      rating: 4,
      comment: "Pelayanan cepat, tapi tempat parkir agak sempit.",
      date: "2025-10-12",
    },
  ],
};
