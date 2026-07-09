// frontend/src/app/reset-password/page.tsx
import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#2b210a]" />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
