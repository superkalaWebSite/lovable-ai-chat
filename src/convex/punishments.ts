import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireAdmin } from "./helpers";

const DAY = 24 * 60 * 60 * 1000;
/** مجازات «همیشگی» با یک تاریخ دور ذخیره می‌شود (۱۰۰ سال دیگر) */
const PERMANENT_YEARS = 100;
/** اگر زمان باقی‌مانده از این حد بیشتر باشد، مجازات «همیشگی» حساب می‌شود */
const FOREVER_THRESHOLD = 10 * 365 * DAY;

/** لیست کاربران به همراه وضعیت مجازات (فقط مدیر) */
export const listUsers = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const now = Date.now();
    const accounts = await ctx.db.query("accounts").collect();
    return accounts
      .map((account) => ({
        _id: account._id,
        username: account.username,
        role: account.role,
        createdAt: account.createdAt,
        supportBannedUntil: account.supportBannedUntil ?? 0,
        discountBannedUntil: account.discountBannedUntil ?? 0,
        reviewBannedUntil: account.reviewBannedUntil ?? 0,
        supportBanned: (account.supportBannedUntil ?? 0) > now,
        discountBanned: (account.discountBannedUntil ?? 0) > now,
        reviewBanned: (account.reviewBannedUntil ?? 0) > now,
        supportBannedForever:
          (account.supportBannedUntil ?? 0) - now > FOREVER_THRESHOLD,
        discountBannedForever:
          (account.discountBannedUntil ?? 0) - now > FOREVER_THRESHOLD,
        reviewBannedForever:
          (account.reviewBannedUntil ?? 0) - now > FOREVER_THRESHOLD,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

async function setBan(
  ctx: MutationCtx,
  args: { token: string; accountId: Id<"accounts">; days: number },
  field: "supportBannedUntil" | "discountBannedUntil" | "reviewBannedUntil",
) {
  const manager = await requireAdmin(ctx, args.token);
  // ۰ = رفع مجازات، ۱ تا ۳۰ = روز، -۱ = همیشگی
  if (args.days !== -1 && (args.days < 0 || args.days > 30)) {
    throw new Error("مدت مجازات باید ۰ (رفع)، ۱ تا ۳۰ روز یا همیشگی باشد.");
  }
  const account = await ctx.db.get(args.accountId);
  if (!account) throw new Error("کاربر یافت نشد.");
  if (manager._id === account._id) {
    throw new Error("نمی‌توانی برای حساب خودت مجازات ثبت کنی.");
  }
  const until =
    args.days === -1
      ? Date.now() + PERMANENT_YEARS * 365 * DAY
      : args.days > 0
        ? Date.now() + args.days * DAY
        : 0;
  if (field === "supportBannedUntil") {
    await ctx.db.patch(args.accountId, { supportBannedUntil: until });
  } else if (field === "discountBannedUntil") {
    await ctx.db.patch(args.accountId, { discountBannedUntil: until });
  } else {
    await ctx.db.patch(args.accountId, { reviewBannedUntil: until });
  }
}

/** مسدود کردن (یا رفع) گپ پشتیبانی برای یک کاربر */
export const setSupportBan = mutation({
  args: { token: v.string(), accountId: v.id("accounts"), days: v.number() },
  handler: async (ctx, args) => {
    await setBan(ctx, args, "supportBannedUntil");
  },
});

/** غیرفعال کردن (یا برگرداندن) تخفیف‌ها برای یک کاربر */
export const setDiscountBan = mutation({
  args: { token: v.string(), accountId: v.id("accounts"), days: v.number() },
  handler: async (ctx, args) => {
    await setBan(ctx, args, "discountBannedUntil");
  },
});

/** ممنوع کردن (یا اجازه دادن) ثبت نظر برای یک کاربر */
export const setReviewBan = mutation({
  args: { token: v.string(), accountId: v.id("accounts"), days: v.number() },
  handler: async (ctx, args) => {
    await setBan(ctx, args, "reviewBannedUntil");
  },
});
