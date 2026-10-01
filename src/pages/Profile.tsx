import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatPrice } from "@/lib/shop";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  CalendarDays,
  KeyRound,
  LifeBuoy,
  LogOut,
  Package,
  ShieldCheck,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, token, isAdmin, signOut } = useAuth();
  const cart = useQuery(api.cart.myCart, token ? { token } : "skip");
  const orders = useQuery(api.cart.myOrders, token ? { token } : "skip");
  const navigate = useNavigate();

  const cartCount = cart?.reduce((sum, item) => sum + item.qty, 0) ?? 0;

  const handleSignOut = () => {
    void signOut().then(() => {
      toast.success("از حسابت خارج شدی");
      navigate("/");
    });
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* کارت حساب */}
      <Card className="overflow-hidden rounded-3xl border-border/70 shadow-md">
        <div className="h-20 bg-gradient-to-l from-primary via-rose-600 to-orange-500" />
        <CardContent className="-mt-10 pb-6">
          <div className="flex flex-wrap items-end gap-4">
            <span className="flex size-20 items-center justify-center rounded-3xl border-4 border-card bg-foreground text-3xl font-black text-white">
              {user.username.slice(0, 1)}
            </span>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black sm:text-2xl">
                  {user.username}
                </h1>
                <Badge
                  className={
                    isAdmin
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {isAdmin ? "مدیر سایت" : "کاربر"}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                عضویت از {formatDate(user.createdAt)}
              </p>
            </div>

            <div className="ms-auto pb-1">
              <Button variant="outline" className="gap-2 rounded-xl" onClick={handleSignOut}>
                <LogOut className="size-4" /> خروج
              </Button>
            </div>
          </div>

          {/* دسترسی‌های سریع */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              to="/cart"
              className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShoppingCart className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-black">سبد خرید</span>
                <span className="text-xs text-muted-foreground">
                  {cartCount.toLocaleString("fa-IR")} کالا
                </span>
              </span>
              <ArrowLeft className="ms-auto size-4 text-muted-foreground transition-transform group-hover:-translate-x-1" />
            </Link>

            <Link
              to="/support"
              className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LifeBuoy className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-black">گپ پشتیبانی</span>
                <span className="text-xs text-muted-foreground">
                  جواب سوالاتت اینجاست
                </span>
              </span>
              <ArrowLeft className="ms-auto size-4 text-muted-foreground transition-transform group-hover:-translate-x-1" />
            </Link>

            {isAdmin ? (
              <Link
                to="/admin"
                className="group flex items-center gap-3 rounded-2xl bg-foreground p-4 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-red-400">
                  <ShieldCheck className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-black">
                    پنل کنترل سایت
                  </span>
                  <span className="text-xs text-white/60">
                    کالاها + جواب به کاربرها
                  </span>
                </span>
                <ArrowLeft className="ms-auto size-4 text-white/60 transition-transform group-hover:-translate-x-1" />
              </Link>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/40 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <KeyRound className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-black">
                    حساب امن دو مرحله‌ای
                  </span>
                  <span className="text-xs text-muted-foreground">
                    رمز شما دوبار ثبت و هش شده است
                  </span>
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* سفارش‌ها */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Package className="size-5 text-primary" />
          <h2 className="text-xl font-black">سفارش‌های من</h2>
        </div>

        {orders === undefined ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 py-14 text-center">
            <span className="text-5xl">📦</span>
            <h3 className="mt-3 font-black">هنوز سفارشی ثبت نکرده‌ای</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              اولین سفارشت را همین حالا بگذار!
            </p>
            <Button className="mt-4 rounded-xl" asChild>
              <Link to="/shop">شروع خرید</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order._id} className="rounded-2xl border-border/70 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm font-black">
                      سفارش #{order._id.slice(-6).toUpperCase()}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(order.createdAt)}</span>
                      <Badge
                        variant="outline"
                        className="border-emerald-300 text-emerald-700"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li
                        key={`${order._id}-${item.productId}`}
                        className="flex items-center gap-3"
                      >
                        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-lg">
                          {item.emoji}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {item.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ×{item.qty.toLocaleString("fa-IR")}
                        </span>
                        <span className="w-32 text-left font-bold">
                          {formatPrice(item.price * item.qty)} تومان
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserRound className="size-3.5" /> ارسال به نام{" "}
                      {user.username}
                    </span>
                    <span className="font-black text-primary">
                      مجموع: {formatPrice(order.total)} تومان
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
