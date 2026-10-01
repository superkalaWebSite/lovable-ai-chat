import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { accountFromToken, requireAccount } from "./helpers";

/** سبد خرید کاربر همراه اطلاعات کامل محصول (null اگر وارد نشده باشد) */
export const myCart = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const account = await accountFromToken(ctx, token);
    if (!account) return null;
    // اگر تخفیف حساب کاربر مسدود شده باشد، قیمت بدون تخفیف اعمال می‌شود
    const discountBanned = (account.discountBannedUntil ?? 0) > Date.now();
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_account", (q) => q.eq("accountId", account._id))
      .collect();
    const result = [];
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (!product) continue;
      const unitPrice =
        discountBanned && product.oldPrice !== undefined
          ? product.oldPrice
          : product.price;
      result.push({ _id: item._id, qty: item.qty, product, unitPrice });
    }
    return result;
  },
});

/** افزودن محصول به سبد خرید */
export const add = mutation({
  args: { token: v.string(), productId: v.id("products") },
  handler: async (ctx, { token, productId }) => {
    const account = await requireAccount(ctx, token);
    const product = await ctx.db.get(productId);
    if (!product) throw new Error("محصول یافت نشد.");
    if (product.stock < 1) throw new Error("این محصول موجود نیست.");

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_account", (q) => q.eq("accountId", account._id))
      .collect();
    const existing = items.find((item) => item.productId === productId);

    if (existing) {
      await ctx.db.patch(existing._id, { qty: existing.qty + 1 });
    } else {
      await ctx.db.insert("cartItems", {
        accountId: account._id,
        productId,
        qty: 1,
      });
    }
  },
});

/** تغییر تعداد (اگر شد ۱، آیتم حذف می‌شود) */
export const setQty = mutation({
  args: { token: v.string(), itemId: v.id("cartItems"), qty: v.number() },
  handler: async (ctx, { token, itemId, qty }) => {
    const account = await requireAccount(ctx, token);
    const item = await ctx.db.get(itemId);
    if (!item || item.accountId !== account._id) {
      throw new Error("آیتم سبد خرید یافت نشد.");
    }
    if (qty < 1) {
      await ctx.db.delete(itemId);
      return;
    }
    await ctx.db.patch(itemId, { qty });
  },
});

/** حذف آیتم از سبد */
export const remove = mutation({
  args: { token: v.string(), itemId: v.id("cartItems") },
  handler: async (ctx, { token, itemId }) => {
    const account = await requireAccount(ctx, token);
    const item = await ctx.db.get(itemId);
    if (!item || item.accountId !== account._id) {
      throw new Error("آیتم سبد خرید یافت نشد.");
    }
    await ctx.db.delete(itemId);
  },
});

/** ثبت نهایی سفارش */
export const checkout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const account = await requireAccount(ctx, token);
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_account", (q) => q.eq("accountId", account._id))
      .collect();
    if (items.length === 0) throw new Error("سبد خرید شما خالی است.");

    const discountBanned = (account.discountBannedUntil ?? 0) > Date.now();
    const orderItems = [];
    let total = 0;
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (!product) continue;
      const unitPrice =
        discountBanned && product.oldPrice !== undefined
          ? product.oldPrice
          : product.price;
      orderItems.push({
        productId: product._id,
        title: product.title,
        emoji: product.emoji,
        price: unitPrice,
        qty: item.qty,
      });
      total += unitPrice * item.qty;
      await ctx.db.patch(product._id, {
        stock: Math.max(0, product.stock - item.qty),
      });
      await ctx.db.delete(item._id);
    }
    if (orderItems.length === 0) throw new Error("سبد خرید شما خالی است.");

    const orderId = await ctx.db.insert("orders", {
      accountId: account._id,
      items: orderItems,
      total,
      status: "در حال پردازش",
      createdAt: Date.now(),
    });
    return { orderId, total };
  },
});

/** سفارش‌های کاربر */
export const myOrders = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const account = await accountFromToken(ctx, token);
    if (!account) return [];
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_account", (q) => q.eq("accountId", account._id))
      .collect();
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  },
});
