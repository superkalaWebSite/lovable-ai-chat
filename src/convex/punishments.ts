import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireAdmin } from "./helpers";

const DAY = 24 * 60 * 60 * 1000;

/** لیست کاربران به همراه وضعیت مجازات (فقط مدیر) */
export const listUsers = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const now = Date.now();
    const accounts = await ctx.db.query("accounts").collect();
    return accounts
      .filter((account) => account.role === "user")
      .map((account) => ({
        _id: account._id,
        username: account.username,
        createdAt: account.createdAt,
        supportBannedUntil: account.supportBannedUntil ?? 0,
        discountBannedUntil: account.discountBannedUntil ?? 0,
        supportBanned: (account.supportBannedUntil ?? 0) > now,
        discountBanned: (account.discountBannedUntil ?? 0) > now,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

async function setBan(
  ctx: MutationCtx,
  args: { token: string; accountId: Id<"accounts">; days: number },
  field: "supportBannedUntil" | "discountBannedUntil",
) {
  await requireAdmin(ctx, args.token);
  if (args.days < 0 || args.days > 30) {
    throw new Error("مدت مجازات باید بین ۰ تا ۳۰ روز باشد.");
  }
  const account = await ctx.db.get(args.accountId);
  if (!account) throw new Error("کاربر یافت نشد.");
  const until = args.days > 0 ? Date.now() + args.days * DAY : 0;
  if (field === "supportBannedUntil") {
    await ctx.db.patch(args.accountId, { supportBannedUntil: until });
  } else {
    await ctx.db.patch(args.accountId, { discountBannedUntil: until });
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
