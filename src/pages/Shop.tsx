import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { ProductCard } from "@/components/ProductCard";
import { ProductDialog } from "@/components/ProductDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { CATEGORIES, discountPercent } from "@/lib/shop";
import { useQuery } from "convex/react";
import { PackageSearch, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

const SORTS = [
  { value: "newest", label: "پیشنهاد ما" },
  { value: "rating", label: "بیشترین امتیاز" },
  { value: "cheap", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
  { value: "discount", label: "بیشترین تخفیف" },
] as const;

export default function Shop() {
  const products = useQuery(api.products.list);
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const cat = searchParams.get("cat") ?? "";
  const [term, setTerm] = useState(q);
  const [sort, setSort] = useState<string>("newest");
  const [selected, setSelected] = useState<Doc<"products"> | null>(null);

  useEffect(() => setTerm(q), [q]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    const clean = term.trim();
    if (clean) params.set("q", clean);
    else params.delete("q");
    setSearchParams(params, { replace: true });
  };

  const pickCategory = (name: string) => {
    // با انتخاب دسته، جستجوی قبلی پاک می‌شود تا همه محصولات همان دسته دیده شود
    const params = new URLSearchParams();
    if (name) params.set("cat", name);
    setSearchParams(params);
  };

  const all = products ?? [];
  const countFor = (name: string) =>
    name ? all.filter((product) => product.category === name).length : all.length;
  const filtered = all
    .filter((product) => {
      const matchCat = !cat || product.category === cat;
      const needle = q.trim().toLowerCase();
      const matchQ =
        !needle ||
        product.title.toLowerCase().includes(needle) ||
        product.brand.toLowerCase().includes(needle) ||
        product.category.toLowerCase().includes(needle);
      return matchCat && matchQ;
    })
    .sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "cheap") return a.price - b.price;
      if (sort === "expensive") return b.price - a.price;
      if (sort === "discount")
        return (
          discountPercent(b.price, b.oldPrice) -
          discountPercent(a.price, a.oldPrice)
        );
      return 0;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* سربرگ */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">
            {cat || (q ? `نتایج جستجو: «${q}»` : "فروشگاه سوپر کالا")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products === undefined
              ? "در حال بارگذاری..."
              : `${filtered.length.toLocaleString("fa-IR")} محصول پیدا شد`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={submitSearch} className="relative">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="جستجو..."
              className="h-10 w-44 rounded-xl ps-9 sm:w-64"
            />
          </form>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-10 w-40 rounded-xl" title="مرتب‌سازی">
              <SlidersHorizontal className="size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* چیپ‌های دسته‌بندی */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => pickCategory("")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            !cat
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/70 bg-card hover:border-primary/40"
          }`}
        >
          همه
          {products !== undefined && (
            <span className="opacity-70">
              {" "}
              ({all.length.toLocaleString("fa-IR")})
            </span>
          )}
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category.name}
            type="button"
            onClick={() => pickCategory(category.name)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              cat === category.name
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/70 bg-card hover:border-primary/40"
            }`}
          >
            {category.emoji} {category.name}
            {products !== undefined && (
              <span className="opacity-70">
                {" "}
                ({countFor(category.name).toLocaleString("fa-IR")})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* گرید محصولات */}
      <div className="mt-7">
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 py-20 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-muted text-3xl">
              🔍
            </span>
            <h2 className="mt-4 text-lg font-black">محصولی پیدا نشد</h2>
            <p className="mt-1 max-w-sm text-sm leading-7 text-muted-foreground">
              با عبارت دیگری جستجو کن یا دسته‌بندی را عوض کن. شاید هم اول
              یک حساب بسازی و بعد بگردی!
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" onClick={() => pickCategory("")}>
                نمایش همه محصولات
              </Button>
              <Button asChild>
                <Link to="/auth">ساخت حساب</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onOpen={setSelected}
              />
            ))}
          </div>
        )}

        {products !== undefined && filtered.length > 0 && (
          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <PackageSearch className="size-4" />
            همه {filtered.length.toLocaleString("fa-IR")} محصول نمایش داده شد
          </p>
        )}
      </div>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
