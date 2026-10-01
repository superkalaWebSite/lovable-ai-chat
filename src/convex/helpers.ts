import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const ADMIN_USERNAME = "کیان دریاباری";
export const ADMIN_SALT = "supercala-admin-2026";
/** sha256(ADMIN_SALT + ":" + "kian2012gg") */
export const ADMIN_PASSWORD_HASH =
  "9910d89c556455bf8a72590e98bb9948a2bb583918610e99b3a26af9138d8ffd";

export async function accountFromToken(
  ctx: QueryCtx | MutationCtx,
  token: string,
): Promise<Doc<"accounts"> | null> {
  if (!token) return null;
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();
  if (!session) return null;
  return await ctx.db.get(session.accountId);
}

export async function requireAccount(
  ctx: QueryCtx | MutationCtx,
  token: string,
): Promise<Doc<"accounts">> {
  const account = await accountFromToken(ctx, token);
  if (!account) throw new Error("لطفا ابتدا وارد حساب کاربری شوید.");
  return account;
}

/** مقام‌هایی که به پنل کنترل سایت دسترسی کامل دارند */
export const ADMIN_ROLES = ["admin", "partner"] as const;

export function isAdminRole(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  token: string,
): Promise<Doc<"accounts">> {
  const account = await requireAccount(ctx, token);
  if (!isAdminRole(account.role)) {
    throw new Error("شما دسترسی مدیریت ندارید.");
  }
  return account;
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function publicAccount(account: Doc<"accounts">) {
  return {
    _id: account._id,
    username: account.username,
    role: account.role,
    createdAt: account.createdAt,
    supportBannedUntil: account.supportBannedUntil ?? 0,
    discountBannedUntil: account.discountBannedUntil ?? 0,
  };
}

export type PublicAccount = ReturnType<typeof publicAccount>;
export type AccountId = Id<"accounts">;
