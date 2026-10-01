import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import {
  ADMIN_PASSWORD_HASH,
  ADMIN_SALT,
  ADMIN_USERNAME,
  normalizeUsername,
  publicAccount,
  requireAdmin,
} from "./helpers";

/** نام کاربری رزرو شده برای مدیر سایت */
const RESERVED = normalizeUsername(ADMIN_USERNAME);

/** هش معتبر SHA-256 باید دقیقا ۶۴ کاراکتر hex باشد */
const HEX64 = /^[0-9a-f]{64}$/;

async function createSession(
  ctx: MutationCtx,
  accountId: Id<"accounts">,
): Promise<string> {
  const token =
    Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  await ctx.db.insert("sessions", { token, accountId, createdAt: Date.now() });
  return token;
}

/**
 * ساخت حساب اولیه مدیر (فقط یک بار). هیچ پارامتری نمی‌گیرد تا کسی
 * نتواند هش دلخواه جایگزین کند.
 */
export const seedAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_usernameLower", (q) => q.eq("usernameLower", RESERVED))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("accounts", {
      username: ADMIN_USERNAME,
      usernameLower: RESERVED,
      salt: ADMIN_SALT,
      passwordHash: ADMIN_PASSWORD_HASH,
      role: "admin",
      createdAt: Date.now(),
    });
  },
});

/** مرحله ۱ ورود: پیدا کردن نام کاربری و برگرداندن salt برای هش کردن رمز */
export const getSalt = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_usernameLower", (q) =>
        q.eq("usernameLower", normalizeUsername(username)),
      )
      .unique();
    if (!account) return null;
    return { salt: account.salt, username: account.username };
  },
});

/**
 * ثبت‌نام بدون ایمیل: فقط نام کاربری + رمز (کلاینت دو بار رمز را می‌گیرد،
 * هش آن را می‌فرستد). برای مدیر هم رمز از قبل هش شده روی سرور است.
 */
export const register = mutation({
  args: {
    username: v.string(),
    salt: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, { username, salt, passwordHash }) => {
    const clean = username.trim();
    if (clean.length < 3) {
      throw new Error("نام کاربری باید حداقل ۳ حرف باشد.");
    }
    if (!HEX64.test(passwordHash) || salt.length < 16) {
      throw new Error("اطلاعات رمز عبور نامعتبر است. دوباره تلاش کنید.");
    }
    const lower = normalizeUsername(clean);
    if (lower === RESERVED) {
      throw new Error("این نام کاربری رزرو شده است.");
    }
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_usernameLower", (q) => q.eq("usernameLower", lower))
      .unique();
    if (existing) {
      throw new Error("این نام کاربری قبلا ثبت شده است.");
    }
    const accountId = await ctx.db.insert("accounts", {
      username: clean,
      usernameLower: lower,
      salt,
      passwordHash,
      role: "user",
      createdAt: Date.now(),
    });
    const token = await createSession(ctx, accountId);
    return { token };
  },
});

/** ورود: کلاینت هشِ (salt + رمز) را می‌فرستد و ما مقایسه می‌کنیم */
export const login = mutation({
  args: { username: v.string(), passwordHash: v.string() },
  handler: async (ctx, { username, passwordHash }) => {
    // هر ورودی غیراستاندارد همان اول رد می‌شود
    if (!HEX64.test(passwordHash) || username.trim().length < 3) {
      throw new Error("نام کاربری یا رمز عبور اشتباه است.");
    }
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_usernameLower", (q) =>
        q.eq("usernameLower", normalizeUsername(username)),
      )
      .unique();
    if (
      !account ||
      !account.passwordHash ||
      account.passwordHash !== passwordHash
    ) {
      throw new Error("نام کاربری یا رمز عبور اشتباه است.");
    }
    const token = await createSession(ctx, account._id);
    return { token, role: account.role };
  },
});

export const getCurrentUser = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!token) return null;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (!session) return null;
    const account = await ctx.db.get(session.accountId);
    if (!account) return null;
    return publicAccount(account);
  },
});

/** مقام‌های قابل انتخاب در پنل مدیریت */
const ROLES = ["user", "supervisor", "admin", "partner"] as const;

/**
 * تغییر مقام یک کاربر لاگین‌شده (فقط مدیر سایت).
 * حساب مدیر اصلی و حساب خودِ مدیر قابل تغییر نیستند تا کنترل پنل از دست نرود.
 */
export const setRole = mutation({
  args: {
    token: v.string(),
    accountId: v.id("accounts"),
    role: v.union(
      v.literal("user"),
      v.literal("supervisor"),
      v.literal("admin"),
      v.literal("partner"),
    ),
  },
  handler: async (ctx, { token, accountId, role }) => {
    const manager = await requireAdmin(ctx, token);
    if (manager._id === accountId) {
      throw new Error("مقام حساب خودت قابل تغییر نیست.");
    }
    const account = await ctx.db.get(accountId);
    if (!account) throw new Error("کاربر یافت نشد.");
    if (account.usernameLower === RESERVED) {
      throw new Error("مقام مدیر اصلی سایت قابل تغییر نیست.");
    }
    if (!(ROLES as readonly string[]).includes(role)) {
      throw new Error("مقام انتخاب‌شده معتبر نیست.");
    }
    await ctx.db.patch(accountId, { role });
    return accountId;
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();
    if (session) await ctx.db.delete(session._id);
  },
});
