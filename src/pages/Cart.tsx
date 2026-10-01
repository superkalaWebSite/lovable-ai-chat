import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { friendlyError } from "@/lib/crypto";
import { categoryTile, formatPrice } from "@/lib/shop";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const FREE_SHIPPING_FROM = 500000;
const SHIPPING_COST = 59000;

export default function CartPage() {
  const { token, isAuthenticated } = useAuth();
  const cart = useQuery(api.cart.myCart, token && isAuthenticated ? { token } : "skip");
  const setQtyMutation = useMutation(api.cart.setQty);
  const removeMutation = useMutation(api.cart.remove);
  const checkoutMutation = useMutation(api.cart.checkout);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const items = cart ?? [];
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );
  const shipping =
    items.length === 0 || total >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  const grand = total + shipping;

  const changeQty = async (itemId: Id<"cartItems">, qty: number) => {
    try {
      await setQtyMutation({ token, itemId, qty });
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const removeItem = async (itemId: Id<"cartItems">) => {
    try {
      await removeMutation({ token, itemId });
      toast.success("از سبد خرید حذف شد");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const checkout = async () => {
    setBusy(true);
    try {
      const result = await checkoutMutation({ token });
      toast.success(
        `سفارش ثبت شد! مبلغ ${formatPrice(result.total)} تومان — به زودی ارسال می‌شود 🚚`,
      );
      navigate("/profile");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShoppingCart className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">سبد خرید</h1>
          <p className="text-sm text-muted-foreground">
            {cart === undefined
              ? "در حال بارگذاری..."
              : `${items.length.toLocaleString("fa-IR")} کالا در سبد شما`}
          </p>
        </div>
      </div>

      {cart === undefined ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 py-20 text-center">
          <span className="text-6xl">🛒</span>
          <h2 className="mt-4 text-lg font-black">سبد خریدت خالیه!</h2>
          <p className="mt-1 max-w-sm text-sm leading-7 text-muted-foreground">
            از بین هزاران کالای سوپر کالا انتخاب کن و به سبد اضافه کن.
          </p>
          <Button className="mt-5 gap-2 rounded-xl" asChild>
            <Link to="/shop">
              رفتن به فروشگاه <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
          {/* اقلام */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
              >
                <div
                  className={`flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-3xl ${categoryTile(
                    item.product.category,
                  )}`}
                >
                  {item.product.emoji}
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    to="/shop"
                    className="line-clamp-2 text-sm font-bold hover:text-primary"
                  >
                    {item.product.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.product.brand} — {formatPrice(item.product.price)} تومان
                    برای هر عدد
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-full border border-border/70 p-1">
                  <button
                    type="button"
                    className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => void changeQty(item._id, item.qty - 1)}
                    aria-label="کم کردن"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-black">
                    {item.qty.toLocaleString("fa-IR")}
                  </span>
                  <button
                    type="button"
                    className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => void changeQty(item._id, item.qty + 1)}
                    aria-label="زیاد کردن"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <div className="w-32 text-left font-black text-primary">
                  {formatPrice(item.product.price * item.qty)}
                  <span className="ms-1 text-xs font-bold">تومان</span>
                </div>

                <button
                  type="button"
                  className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => void removeItem(item._id)}
                  aria-label="حذف از سبد"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          {/* خلاصه سفارش */}
          <Card className="sticky top-40 rounded-2xl border-border/70 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">خلاصه سفارش</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>قیمت کالاها</span>
                <span>{formatPrice(total)} تومان</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Truck className="size-4" /> هزینه ارسال
                </span>
                <span>
                  {shipping === 0 ? (
                    <span className="font-bold text-emerald-600">رایگان</span>
                  ) : (
                    `${formatPrice(shipping)} تومان`
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <p className="rounded-xl bg-amber-100 px-3 py-2 text-xs leading-6 text-amber-800">
                  برای ارسال رایگان{" "}
                  <b>{formatPrice(FREE_SHIPPING_FROM - total)} تومان</b> دیگر
                  خرید کن.
                </p>
              )}
              <Separator />
              <div className="flex justify-between text-base font-black">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-primary">{formatPrice(grand)} تومان</span>
              </div>

              <Button
                className="mt-2 h-12 w-full gap-2 rounded-xl"
                size="lg"
                onClick={() => void checkout()}
                disabled={busy}
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> در حال ثبت
                    سفارش...
                  </>
                ) : (
                  <>ثبت نهایی سفارش</>
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground">
                با ثبت سفارش، قوانین بازگشت ۷ روزه را می‌پذیرید.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
