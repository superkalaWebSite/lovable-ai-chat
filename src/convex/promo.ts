import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwner } from "./helpers";

/** متن‌های پیش‌فرض بنر صفحه اصلی */
export const PROMO_DEFAULTS = {
  badge: "🔥 جشنواره تخفیف پاییزه — تا ۴۰٪ تخفیف",
  title: "روی محصولات منتخب تا",
  highlight: "۴۰٪ تخفیف",
  description: "موجودی محدوده؛ همین الان سفارش بده تا فردا ارسال بشه.",
  buttonLabel: "دیدن تخفیف‌ها",
  buttonLink: "/shop",
  active: true,
};

export type PromoBanner = typeof PROMO_DEFAULTS;

/** بنر فعال صفحه اصلی — اگر چیزی ذخیره نشده باشد متن‌های پیش‌فرض برمی‌گردد */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const saved = await ctx.db
      .query("promos")
      .withIndex("by_updatedAt")
      .order("desc")
      .first();
    // چیزی ذخیره نشده ⇒ بنر با متن‌های پیش‌فرض نمایش داده می‌شود
    if (!saved) {
      return { ...PROMO_DEFAULTS, saved: false };
    }
    if (!saved.active) {
      return { ...PROMO_DEFAULTS, saved: true, active: false };
    }
    return {
      badge: saved.badge,
      title: saved.title,
      highlight: saved.highlight,
      description: saved.description,
      buttonLabel: saved.buttonLabel,
      buttonLink: saved.buttonLink,
      active: true,
      saved: true,
    };
  },
});

function clean(value: string, max: number): string {
  return value.trim().slice(0, max);
}

/** ذخیره یا ویرایش بنر (فقط مدیر اصلی سایت) */
export const save = mutation({
  args: {
    token: v.string(),
    badge: v.string(),
    title: v.string(),
    highlight: v.string(),
    description: v.string(),
    buttonLabel: v.string(),
    buttonLink: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx, args.token);
    const buttonLink = clean(args.buttonLink, 120) || "/shop";
    const patch = {
      badge: clean(args.badge, 120) || PROMO_DEFAULTS.badge,
      title: clean(args.title, 120) || PROMO_DEFAULTS.title,
      highlight: clean(args.highlight, 60) || PROMO_DEFAULTS.highlight,
      description: clean(args.description, 300),
      buttonLabel: clean(args.buttonLabel, 60) || PROMO_DEFAULTS.buttonLabel,
      buttonLink,
      active: args.active,
      updatedAt: Date.now(),
    };
    const existing = await ctx.db
      .query("promos")
      .withIndex("by_updatedAt")
      .order("desc")
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return await ctx.db.insert("promos", patch);
  },
});

/** حذف کامل بنر — صفحه اصلی به متن‌های پیش‌فرض برمی‌گردد (فقط مدیر اصلی) */
export const remove = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireOwner(ctx, token);
    const existing = await ctx.db
      .query("promos")
      .withIndex("by_updatedAt")
      .order("desc")
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});