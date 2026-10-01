import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  accountFromToken,
  requireAccount,
  requireAdmin,
} from "./helpers";

function cleanText(text: string): string {
  const clean = text.trim();
  if (!clean) throw new Error("پیام خالی است.");
  if (clean.length > 1000) throw new Error("پیام بیش از حد طولانی است.");
  return clean;
}

/** ارسال پیام کاربر به پشتیبانی (با بررسی مجازات مدیر) */
export const send = mutation({
  args: { token: v.string(), text: v.string() },
  handler: async (ctx, { token, text }) => {
    const account = await requireAccount(ctx, token);
    const bannedUntil = account.supportBannedUntil ?? 0;
    if (bannedUntil > Date.now()) {
      const hours = Math.max(1, Math.ceil((bannedUntil - Date.now()) / 3600000));
      throw new Error(
        `به دلیل نقض قوانین، دسترسی شما به گپ پشتیبانی تا ${hours.toLocaleString("fa-IR")} ساعت دیگر بسته است.`,
      );
    }
    await ctx.db.insert("supportMessages", {
      accountId: account._id,
      text: cleanText(text),
      from: "user",
      createdAt: Date.now(),
    });
  },
});

/** گفتگوی کاربر با پشتیبانی */
export const myThread = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const account = await accountFromToken(ctx, token);
    if (!account) return [];
    const messages = await ctx.db
      .query("supportMessages")
      .withIndex("by_account", (q) => q.eq("accountId", account._id))
      .collect();
    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

/** همه گفتگوها برای پنل مدیریت */
export const adminInbox = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const messages = await ctx.db.query("supportMessages").collect();
    const accounts = await ctx.db.query("accounts").collect();
    const names = new Map(accounts.map((a) => [a._id, a.username]));
    return messages
      .map((m) => ({
        _id: m._id,
        accountId: m.accountId,
        username: names.get(m.accountId) ?? "کاربر حذف شده",
        text: m.text,
        from: m.from,
        createdAt: m.createdAt,
      }))
      .sort((a, b) => a.createdAt - b.createdAt);
  },
});

/** پاسخ مدیر به کاربر */
export const adminReply = mutation({
  args: { token: v.string(), accountId: v.id("accounts"), text: v.string() },
  handler: async (ctx, { token, accountId, text }) => {
    await requireAdmin(ctx, token);
    const target = await ctx.db.get(accountId);
    if (!target) throw new Error("کاربر یافت نشد.");
    await ctx.db.insert("supportMessages", {
      accountId,
      text: cleanText(text),
      from: "admin",
      createdAt: Date.now(),
    });
  },
});
