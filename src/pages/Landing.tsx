import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import heroBg from "@/assets/hero-bg.svg";
import { ProductCard } from "@/components/ProductCard";
import { ProductDialog } from "@/components/ProductDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, discountPercent, formatDate, formatPrice } from "@/lib/shop";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
  CreditCard,
  Headphones,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

const FEATURES = [
  {
    icon: Truck,
    title: "ارسال سریع",
    text: "تحویل ۱ تا ۳ روزه به سراسر کشور و رایگان بالای ۵۰۰ هزار تومان",
  },
  {
    icon: ShieldCheck,
    title: "ضمانت اصالت",
    text: "همه کالاها اصل و دارای ۷ روز ضمانت بازگشت بی‌قید و شرط",
  },
  {
    icon: Headphones,
    title: "پشتیبانی واقعی",
    text: "گپ آنلاین با تیم پشتیبانی؛ جواب سریع و انسانی، نه ربات!",
  },
  {
    icon: CreditCard,
    title: "پرداخت امن",
    text: "پرداخت در محل یا آنلاین با درگاه امن و رمزنگاری شده",
  },
];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay, ease: "easeOut" as const },
  };
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const products = useQuery(api.products.list);
  const reviews = useQuery(api.reviews.list);
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<Doc<"products"> | null>(null);

  const all = products ?? [];
  const featured = [...all].sort((a, b) => b.rating - a.rating).slice(0, 8);
  // بنر تخفیف‌ها: حداکثر ۵ محصول؛ اگر بیشتر از ۵ تا بود، لینک «بیشتر» به فروشگاه
  const discounted = all.filter((p) => p.oldPrice !== undefined);
  const deals = discounted.slice(0, 5);
  // حداکثر ۵ نظر در صفحه اصلی؛ اگر بیشتر از ۵ تا بود، لینک «بیشتر» به صفحه نظرات
  const allReviews = reviews ?? [];
  const shownReviews = allReviews.slice(0, 5);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = term.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <div className="overflow-x-clip">
      {/* ───────────── هیرو ───────────── */}
      <section className="relative overflow-hidden">
        {/* پس‌زمینه تصویری صحنه محصولات با پالت سبز روشن (mint) */}
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full select-none object-cover"
        />
        {/* لایه‌های روشن برای خوانا ماندن متن تیره روی عکس (مثل سایت نمونه) */}
        <div className="pointer-events-none absolute inset-0 bg-background/35" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-background/70 via-background/20 to-transparent" />
        <div className="pointer-events-none absolute -top-24 start-[-6rem] size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute top-40 end-[-4rem] size-80 rounded-full bg-green-300/20 blur-3xl" />
        {/* محو تدریجی تصویر به رنگ سایت تا پایین‌تر کاملاً با پس‌زمینه سایت قاطی شود */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-transparent via-40% to-background lg:h-72" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pt-12 pb-32 lg:grid-cols-2 lg:pt-20 lg:pb-40">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="rounded-full border border-foreground/10 bg-card/85 px-3 py-1 text-foreground shadow-sm">
              🔥 جشنواره تخفیف پاییزه — تا ۴۰٪ تخفیف
            </Badge>

            <h1 className="mt-5 text-4xl font-black leading-[1.35] tracking-tight text-foreground [text-shadow:0_2px_22px_rgba(255,255,255,0.95)] sm:text-5xl lg:text-6xl">
              هر چیزی که نیاز داری،
              <br />
              <span className="text-primary">با قیمت منصفانه</span> و ارسال
              سریع
            </h1>

            <p className="mt-4 max-w-lg text-base leading-8 text-foreground/70 [text-shadow:0_1px_16px_rgba(255,255,255,0.95)]">
              سوپر کالا فروشگاه اینترنتی مطمئنه؛ از موبایل و لپتاپ تا لوازم
              خانه و پوشاک — با ضمانت اصالت کالا، ضمانت بازگشت ۷ روزه و
              پشتیبانی آنلاین.
            </p>

            <form onSubmit={submitSearch} className="relative mt-7 max-w-lg">
              <Search className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="دنبال چی می‌گردی؟ مثلا «هندزفری» یا «کتانی»"
                className="h-14 rounded-2xl border-border/70 bg-card ps-12 pe-32 shadow-md"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute end-2 top-1/2 h-10 -translate-y-1/2 rounded-xl px-5"
              >
                جستجو
              </Button>
            </form>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="h-12 gap-2 rounded-2xl px-7 shadow-lg shadow-primary/25"
                asChild
              >
                <Link to="/shop">
                  مشاهده محصولات <ArrowLeft className="size-4" />
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-2xl bg-card/70 px-7 backdrop-blur-sm"
                  asChild
                >
                  <Link to="/auth">ثبت‌نام</Link>
                </Button>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/75 [text-shadow:0_1px_12px_rgba(255,255,255,0.9)]">
              <span className="flex items-center gap-1.5">
                <Truck className="size-4 text-primary" /> ارسال رایگان بالای ۵۰۰ هزار تومان
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-primary" /> ۷ روز ضمانت بازگشت
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-amber-400 text-amber-400" /> امتیاز ۴.۸ از مشتری‌ها
              </span>
            </div>
          </motion.div>

          {/* کلاژ محصولات */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto hidden w-full max-w-md lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="flex aspect-square flex-col justify-between rounded-3xl bg-gradient-to-br from-sky-100 to-blue-200 p-5"
              >
                <span className="text-xs font-bold text-sky-700">موبایل</span>
                <span className="text-7xl">📱</span>
                <span className="w-fit rounded-full bg-white/80 px-2.5 py-1 text-xs font-black text-sky-800 shadow">
                  از ۱۲,۴۹۰,۰۰۰ تومان
                </span>
              </motion.div>

              <motion.div
                className="mt-8 flex aspect-square flex-col justify-between rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-200 p-5"
              >
                <span className="text-xs font-bold text-indigo-700">لپتاپ</span>
                <span className="text-7xl">💻</span>
                <span className="w-fit rounded-full bg-white/80 px-2.5 py-1 text-xs font-black text-indigo-800 shadow">
                  تا ۲۰٪ تخفیف
                </span>
              </motion.div>

              <motion.div
                className="flex aspect-square flex-col justify-between rounded-3xl bg-gradient-to-br from-amber-100 to-orange-200 p-5"
              >
                <span className="text-xs font-bold text-amber-700">لوازم جانبی</span>
                <span className="text-7xl">🎧</span>
                <span className="w-fit rounded-full bg-white/80 px-2.5 py-1 text-xs font-black text-amber-800 shadow">
                  پرفروش هفته
                </span>
              </motion.div>

              <motion.div
                className="mt-8 flex aspect-square flex-col justify-between rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-200 p-5"
              >
                <span className="text-xs font-bold text-emerald-700">خانه</span>
                <span className="text-7xl">🏠</span>
                <span className="w-fit rounded-full bg-white/80 px-2.5 py-1 text-xs font-black text-emerald-800 shadow">
                  ارسال رایگان
                </span>
              </motion.div>
            </div>

            <div className="absolute -bottom-6 start-6 rounded-2xl bg-foreground px-4 py-3 text-white shadow-xl">
              <p className="text-xs text-white/70">پرفروش‌ترین این هفته</p>
              <p className="text-sm font-black">
                📱 گلکسی A55 —{" "}
                <span className="text-green-400">
                  {formatPrice(18990000)} تومان
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────── اعتمادسازی ───────────── */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <motion.div key={feature.title} {...fadeUp(index * 0.08)} className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-black">{feature.title}</h3>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  {feature.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────────── دسته‌بندی‌ها ───────────── */}
      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">دسته‌بندی‌ها</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              از بین هشت دسته، سریع به چیزی که می‌خوای برس
            </p>
          </div>
          <Button variant="ghost" className="gap-1" asChild>
            <Link to="/shop">
              همه محصولات <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {CATEGORIES.map((category, index) => (
            <motion.div key={category.name} {...fadeUp(index * 0.05)}>
              <Link
                to={`/shop?cat=${encodeURIComponent(category.name)}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card p-4 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <span
                  className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl transition-transform group-hover:scale-110 ${category.tile}`}
                >
                  {category.emoji}
                </span>
                <span className="text-xs font-bold leading-5 group-hover:text-primary">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────────── محصولات پرفروش ───────────── */}
      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">
              محصولات پرفروش سوپر کالا
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              منتخب بهترین‌ها بر اساس امتیاز مشتری‌ها
            </p>
          </div>
          <Button variant="ghost" className="gap-1" asChild>
            <Link to="/shop">
              مشاهده همه <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>

        {products === undefined ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onOpen={setSelected}
              />
            ))}
          </div>
        )}
      </section>

      {/* ───────────── بنر پیشنهاد ویژه ───────────── */}
      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="grid gap-6 overflow-hidden rounded-3xl bg-foreground p-6 text-white sm:p-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col justify-center">
            <span className="w-fit rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300">
              ⏳ پیشنهاد شگفت‌انگیز امروز
            </span>
            <h2 className="mt-4 text-2xl font-black leading-9 sm:text-3xl">
              روی محصولات منتخب تا{" "}
              <span className="text-green-400">۴۰٪ تخفیف</span> — تا پایان
              امروز!
            </h2>
            <p className="mt-2 text-sm leading-7 text-white/60">
              موجودی محدوده؛ همین الان سفارش بده تا فردا ارسال بشه.
            </p>
            <div className="mt-5">
              <Button size="lg" className="h-12 w-fit gap-2 rounded-2xl bg-green-600 text-white hover:bg-green-700" asChild>
                <Link to="/shop">
                  دیدن تخفیف‌ها <ArrowLeft className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {(products === undefined ? [] : deals).map((deal) => (
              <button
                key={deal._id}
                type="button"
                onClick={() => setSelected(deal)}
                className="group flex items-center gap-3 rounded-2xl bg-white/5 p-3 text-start transition-colors hover:bg-white/10"
              >
                <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-2xl">
                  {deal.image ? (
                    <img src={deal.image} alt="" className="size-full object-cover" />
                  ) : (
                    deal.emoji
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {deal.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {formatPrice(deal.price)} تومان
                    </span>
                    {deal.oldPrice !== undefined && deal.oldPrice > deal.price && (
                      <span className="text-[11px] text-white/40 line-through">
                        {formatPrice(deal.oldPrice)}
                      </span>
                    )}
                    <span className="rounded-md bg-green-600 px-1.5 py-0.5 text-[10px] font-black">
                      {discountPercent(deal.price, deal.oldPrice).toLocaleString("fa-IR")}٪
                    </span>
                  </span>
                </span>
                <ArrowLeft className="size-4 shrink-0 text-white/40 transition-transform group-hover:-translate-x-0.5" />
              </button>
            ))}
            {products !== undefined && deals.length === 0 && (
              <p className="text-sm text-white/60">
                به‌زودی پیشنهادهای ویژه اضافه می‌شود.
              </p>
            )}
            {products !== undefined && discounted.length > 5 && (
              <Link
                to="/shop"
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/20 py-2.5 text-xs font-bold text-green-300 transition-colors hover:border-green-400/50 hover:bg-white/5"
              >
                دیدن تخفیف‌های بیشتر <ArrowLeft className="size-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ───────────── نظرات کاربران (حداکثر ۵) ───────────── */}
      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">
              نظرات کاربران درباره سوپر کالا
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              تجربه واقعی مشتری‌ها — بیش از ۲۰۰ هزار سفارش موفق
            </p>
          </div>
          <Button variant="ghost" className="gap-1" asChild>
            <Link to="/reviews">
              همه نظرات <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>

        {reviews === undefined ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {shownReviews.map((review, index) => (
              <motion.figure
                key={review._id}
                {...fadeUp(index * 0.1)}
                className="flex flex-col rounded-2xl border border-border/70 bg-card p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-lg font-black text-primary">
                    {review.name.slice(0, 1)}
                  </span>
                  <figcaption>
                    <p className="text-sm font-black">{review.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            className={`size-3.5 ${
                              starIndex < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </figcaption>
                </div>
                <blockquote className="mt-4 text-sm leading-7 text-muted-foreground">
                  «{review.text}»
                </blockquote>
              </motion.figure>
            ))}
          </div>
        )}

        {/* «بیشتر» زیر نظرات — فقط وقتی بیشتر از ۵ نظر ثبت شده باشد */}
        {allReviews.length > 5 && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              className="group gap-2 rounded-full border-border/70 px-6"
              asChild
              title="دیدن نظرات بیشتر"
            >
              <Link to="/reviews">
                <MessageSquare className="size-4 text-primary" />
                دیدن نظرات بیشتر
                <ChevronDown className="size-4 transition-transform group-hover:translate-y-0.5" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
