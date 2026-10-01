import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAccount, requireOwner } from "./helpers";

/** همه کاربران واردشده می‌توانند نظرها را لایک کنند */

const SEED_REVIEWS = [
  {
    name: "سارا محمدی",
    rating: 5,
    text: "سفارشم دو روزه به دستم رسید، بسته‌بندی عالی بود و جواب چت پشتیبانی هم سریع بود. واقعاً حس حرفه‌ای داره!",
  },
  {
    name: "علی رضایی",
    rating: 5,
    text: "قیمت‌ها نسبت به بقیه جاها پایین‌تر بود و ضمانت اصالت کالا هم داشت. برای خرید لپتاپ تردید داشتم ولی عالی بود.",
  },
  {
    name: "مریم احمدی",
    rating: 4,
    text: "ثبت‌نام بدون ایمیل خیلی ساده بود، با نام کاربری و رمز وارد شدم و کل سفارش‌هام توی پروفایلم ذخیره شد.",
  },
];

/** لیست نظرات — جدیدترین اول */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
  },
});

/** ثبت نظر توسط کاربر وارد شده */
export const add = mutation({
  args: { token: v.string(), rating: v.number(), text: v.string() },
  handler: async (ctx, { token, rating, text }) => {
    const account = await requireAccount(ctx, token);
    if ((account.reviewBannedUntil ?? 0) > Date.now()) {
      throw new Error("ثبت نظر برای حساب شما موقتاً غیرفعال است.");
    }
    const clean = text.trim();
    if (clean.length < 5) throw new Error("متن نظر را کامل بنویسید.");
    if (clean.length > 600) throw new Error("متن نظر حداکثر ۶۰۰ کاراکتر است.");
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new Error("امتیاز باید بین ۱ تا ۵ باشد.");
    }
    await ctx.db.insert("reviews", {
      accountId: account._id,
      name: account.username,
      rating: Math.round(rating),
      text: clean,
      createdAt: Date.now(),
    });
  },
});

/** لایک یا برداشتن لایک یک نظر — توسط هر کاربر واردشده */
export const toggleLike = mutation({
  args: { token: v.string(), reviewId: v.id("reviews") },
  handler: async (ctx, { token, reviewId }) => {
    const account = await requireAccount(ctx, token);
    const review = await ctx.db.get(reviewId);
    if (!review) throw new Error("نظر یافت نشد.");
    const liked = review.likedBy ?? [];
    const next = liked.includes(account._id)
      ? liked.filter((id) => id !== account._id)
      : [...liked, account._id];
    await ctx.db.patch(reviewId, { likedBy: next });
    return next.length;
  },
});

/** ویرایش متن و امتیاز یک نظر (فقط مدیر اصلی سایت) */
export const update = mutation({
  args: {
    token: v.string(),
    reviewId: v.id("reviews"),
    text: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, { token, reviewId, text, rating }) => {
    await requireOwner(ctx, token);
    const review = await ctx.db.get(reviewId);
    if (!review) throw new Error("نظر یافت نشد.");
    const clean = text.trim();
    if (clean.length < 5 || clean.length > 600) {
      throw new Error("متن نظر باید بین ۵ تا ۶۰۰ کاراکتر باشد.");
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new Error("امتیاز باید بین ۱ تا ۵ باشد.");
    }
    await ctx.db.patch(reviewId, { text: clean, rating: Math.round(rating) });
  },
});

/** حذف یک نظر (فقط مدیر اصلی سایت) */
export const remove = mutation({
  args: { token: v.string(), reviewId: v.id("reviews") },
  handler: async (ctx, { token, reviewId }) => {
    await requireOwner(ctx, token);
    const review = await ctx.db.get(reviewId);
    if (!review) throw new Error("نظر یافت نشد.");
    await ctx.db.delete(reviewId);
  },
});

/** ساخت نظرات نمونه در اولین اجرا */
export const seedIfEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("reviews").first();
    if (existing) return;
    const now = Date.now();
    for (let i = 0; i < SEED_REVIEWS.length; i++) {
      await ctx.db.insert("reviews", {
        ...SEED_REVIEWS[i],
        createdAt: now - (i + 1) * 6 * 60 * 60 * 1000,
      });
    }
  },
});
