// src/types/domain.ts

export type Role = "user" | "mitra" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar_url?: string | null;
}

/** ====== Auth / User ====== */
export interface AuthResp {
  token: string;
  user: User;
}

export interface MeResp {
  user: User;
}

/** ====== Cafe Galleries ====== */
export interface CafeGallery {
  id: number;
  cafe_id: number;
  image_url: string; // backend harus kirim absolute url atau relative /uploads/...
  created_at?: string;
  updated_at?: string;
}

/** ====== Cafe / Menu / Review ====== */
export interface Cafe {
  id: number;
  name: string;
  slug?: string | null;

  description?: string | null;
  address?: string | null;

  // Sequelize DECIMAL kadang balik string
  lat?: number | string | null;
  lng?: number | string | null;

  phone?: string | null;
  instagram?: string | null;

  /**
   * opening_hours kamu sekarang disimpan JSON.
   * Bisa bentuk object kompleks (day->ranges), jadi pakai unknown atau record fleksibel.
   */
  opening_hours?: Record<string, unknown> | null;

  /** media utama */
  cover_url?: string | null;
  logo_url?: string | null;
  photo_url?: string | null;

  /** galleries (opsional, tergantung endpoint include atau belum) */
  galleries?: CafeGallery[]; // ✅ NEW

  owner?: Pick<User, "id" | "name">;

  distance_m?: number;
}

export interface MenuItem {
  id: number;
  cafe_id: number;
  name: string;
  category?: string | null;
  price: number;
  photo_url?: string | null;
  is_available: boolean;
  description?: string | null;
}

export interface Review {
  id: number;
  cafe_id: number;
  user_id?: number | null;
  rating: number;
  text?: string | null;
  comment?: string | null;
  photos?: unknown;
  created_at: string;
  updated_at: string;

  user?: Pick<User, "id" | "name" | "avatar_url">;
  cafe?: Pick<Cafe, "id" | "name">;

  rating_decimal?: number | string | null;
}

export interface ListReviewsResp {
  total: number;
  data: Review[];
  avg?: number;
  counts?: Record<number, number>;
}

export interface ListCafesResp {
  total: number;
  data: Cafe[];
}

/** ====== Mitra Dashboard ====== */
export interface MitraDashboardResp {
  cards: {
    daily_sales: number;
    monthly_sales: number;
    avg_rating: number;
    review_count: number;
    favorites_count: number;
  };
  visitors: { name: string; value: number }[];
  recommendations: string[];
}

/** ====== Report (Mitra Laporan) ====== */
export type ReportPeriod = "daily" | "monthly" | "yearly";

export interface ReportSeriesPoint {
  name: string;
  value: number;
}

export interface ReportResp {
  series: ReportSeriesPoint[];
  total?: number;
}
