import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { friendlyError } from "@/lib/crypto";
import { getToken } from "@/lib/session";
import { useMutation } from "convex/react";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

/**
 * افزودن به سبد خرید — اگر کاربر لاگین نباشد، به صفحه ورود هدایت می‌شود
 * و بعد از ورود به همان صفحه برمی‌گردد.
 */
export function useAddToCart() {
  const { isAuthenticated } = useAuth();
  const addMutation = useMutation(api.cart.add);
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    async (productId: Id<"products">) => {
      if (!isAuthenticated) {
        const returnTo = `${location.pathname}${location.search}`;
        toast.info("برای خرید ابتدا وارد حساب کاربری شوید");
        navigate(`/auth?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      try {
        await addMutation({ token: getToken(), productId });
        toast.success("به سبد خرید اضافه شد 🛒");
      } catch (error) {
        toast.error(friendlyError(error));
      }
    },
    [isAuthenticated, addMutation, navigate, location.pathname, location.search],
  );
}
