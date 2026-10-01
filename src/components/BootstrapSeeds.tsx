import { api } from "@/convex/_generated/api";
import { useEffect, useRef } from "react";
import { useConvex } from "convex/react";

/**
 * در اولین بار اجرا، حساب مدیر و محصولات نمونه را می‌سازد.
 * (idempotent — اجرای چندباره مشکلی ایجاد نمی‌کند)
 */
export function BootstrapSeeds() {
  const convex = useConvex();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        await convex.mutation(api.accounts.seedAdmin, {});
        await convex.mutation(api.products.seedIfEmpty, {});
      } catch (error) {
        console.warn("seed:", error);
      }
    })();
  }, [convex]);

  return null;
}
