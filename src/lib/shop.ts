/** دسته‌بندی‌های فروشگاه سوپر کالا */
export const CATEGORIES = [
  { name: "موبایل و تبلت", emoji: "📱", tile: "from-sky-100 to-blue-200" },
  { name: "لپتاپ و کامپیوتر", emoji: "💻", tile: "from-indigo-100 to-violet-200" },
  { name: "لوازم جانبی", emoji: "🎧", tile: "from-amber-100 to-orange-200" },
  { name: "خانه و آشپزخانه", emoji: "🏠", tile: "from-emerald-100 to-teal-200" },
  { name: "پوشاک", emoji: "👕", tile: "from-stone-100 to-neutral-300" },
  { name: "ورزشی", emoji: "⚽", tile: "from-lime-100 to-green-200" },
  { name: "آرایشی و بهداشتی", emoji: "💄", tile: "from-fuchsia-100 to-purple-200" },
  { name: "کتاب و اسباب‌بازی", emoji: "📚", tile: "from-yellow-100 to-amber-200" },
] as const;

export function categoryTile(category: string): string {
  return (
    CATEGORIES.find((c) => c.name === category)?.tile ?? "from-stone-100 to-stone-200"
  );
}

export function categoryEmoji(category: string): string {
  return CATEGORIES.find((c) => c.name === category)?.emoji ?? "🛍️";
}

/** قیمت با ارقام فارسی */
export function formatPrice(value: number): string {
  return value.toLocaleString("fa-IR");
}

/** درصد تخفیف روی کارت */
export function discountPercent(price: number, oldPrice?: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
