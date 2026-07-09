export const coffeeShops = [
  {
    slug: "renjana",
    name: "Renjana Coffee",
    rating: 5,
    about: "Renjana Coffee adalah tempat nongkrong nyaman dengan suasana industrial modern, cocok untuk bekerja, diskusi, maupun sekadar menikmati kopi hangat.",
    address:
      "Jl. Depok, Kembangan Kidul, Kembangan Tengah, Kota Semarang, Jawa Tengah",
    hours: "SENIN–MINGGU JAM 10.00–02.00",
    maps: "https://www.google.com/maps?q=Renjana+Coffee+Semarang",
    images: [
      "/img/renjana/1.jpg",
      "/img/renjana/2.jpg",
      "/img/renjana/3.jpg",
      "/img/renjana/4.jpg",
    ],
    menus: {
      "Classic Coffee": [
        { name: "Americano", price: "18K", image: "/menu/americano.png" },
        { name: "Long Black", price: "18K", image: "/menu/longblack.png" },
        { name: "Mochaccino", price: "18K", image: "/menu/irishcoffee.png" },
      ],
      "Espresso Based": [
        { name: "Kohi", price: "18K", image: "/menu/kopsu.png" },
        { name: "Scuzzy", price: "18K", image: "/menu/lime.png" },
        { name: "Carmilla", price: "18K", image: "/menu/pistacio.png" },
        { name: "Rehana", price: "18K", image: "/menu/latte.png" },
      ],
      "Coffee Mocktail": [
        { name: "Alamudy", price: "18K", image: "/menu/lime.png" },
        { name: "Maracuja", price: "18K", image: "/menu/tropical.png" },
        { name: "Peach Eyes", price: "18K", image: "/menu/lychee.png" },
      ],
    },
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
  },
];
