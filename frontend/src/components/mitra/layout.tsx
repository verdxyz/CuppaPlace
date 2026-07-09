// src/app/mitra/layout.tsx
"use client";

import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { routeForRole } from "@/lib/roles";

export default function MitraLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!(user.role === "mitra" || user.role === "admin")) {
      router.replace(routeForRole(user.role));
    }
  }, [loading, user, router, pathname]);

  if (loading) return null;
  if (!user) return null;
  if (!(user.role === "mitra" || user.role === "admin")) return null;

  return <>{children}</>;
}
