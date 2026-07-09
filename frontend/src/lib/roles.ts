// src/lib/roles.ts
import type { Role } from "@/types/domain";
export const DEFAULT_ROUTE: Record<Role, string> = {
  user:  "/pengguna/home",
  mitra: "/mitra/dashboard",
  admin: "/admin",
};

export function routeForRole(role: Role | undefined): string {
  if (!role) return "/";
  return DEFAULT_ROUTE[role] ?? "/";
}

const ALLOW_PREFIX: Record<Role, string[]> = {
  user:  ["/", "/pengguna"],
  mitra: ["/", "/pengguna", "/mitra"],
  admin: ["/", "/pengguna", "/mitra", "/admin"],
};

export function canAccess(role: Role | undefined, path: string): boolean {
  if (!role) return false;
  const prefixes = ALLOW_PREFIX[role] ?? ["/"];
  return prefixes.some((p) => path === p || path.startsWith(p + "/"));
}
