// frontend/src/types/mitra.ts

export type TimeRange = { start: string; end: string };

export type DayHours = {
  open: boolean;
  allDay?: boolean;
  ranges: TimeRange[];
};

export type OpeningHours = {
  mon: DayHours;
  tue: DayHours;
  wed: DayHours;
  thu: DayHours;
  fri: DayHours;
  sat: DayHours;
  sun: DayHours;
};

const DEFAULT_DAY: DayHours = {
  open: true,
  allDay: false,
  ranges: [{ start: "08:00", end: "22:00" }],
};

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  mon: { ...DEFAULT_DAY },
  tue: { ...DEFAULT_DAY },
  wed: { ...DEFAULT_DAY },
  thu: { ...DEFAULT_DAY },
  fri: { ...DEFAULT_DAY },
  sat: { open: true, allDay: false, ranges: [{ start: "08:00", end: "23:00" }] },
  sun: { open: true, allDay: false, ranges: [{ start: "08:00", end: "23:00" }] },
};

export type MitraFormData = {
  cafe_name: string;
  address: string;
  phone: string;
  email: string;

  password: string;
  password2: string;

  nib: string;
  hours: string;
  fasilitas: string[];

  lat?: number;
  lng?: number;
  instagram?: string;

  opening_hours: OpeningHours;

  logoFile: File | null;
  coverFile: File | null;
  galleryFiles: File[];

  logoPreviewUrl: string | null;
  coverPreviewUrl: string | null;
  galleryPreviewUrls: string[];
};
