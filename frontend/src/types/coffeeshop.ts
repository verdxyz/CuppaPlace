export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

export interface MenuItem {
  id?: number;
  name: string;
  price: number;
  image: string;
  category?: string;
}

export interface CoffeeShop {
  name: string;
  address: string;
  rating: number;
  openHours: string;
  images: string[];
  menus: MenuItem[];   
  reviews: Review[];
}
