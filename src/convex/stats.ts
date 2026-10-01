import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOwner } from "./helpers";

/** آمار کلی برای پنل کنترل سایت */
export const adminStats = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireOwner(ctx, token);
    const products = await ctx.db.query("products").collect();
    const accounts = await ctx.db.query("accounts").collect();
    const orders = await ctx.db.query("orders").collect();
    const messages = await ctx.db.query("supportMessages").collect();
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const lowStock = products.filter((p) => p.stock <= 5).length;
    const lastByAccount = new Map();
    for (const message of messages) {
      lastByAccount.set(message.accountId, message);
    }
    return {
      products: products.length,
      users: accounts.filter((a) => a.role !== "admin").length,
      orders: orders.length,
      messages: messages.length,
      revenue,
      lowStock,
      waitingChats: [...lastByAccount.values()].filter(
        (m) => m.from === "user",
      ).length,
    };
  },
});

/** همه سفارش‌ها برای پنل مدیریت */
export const adminOrders = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireOwner(ctx, token);
    const orders = await ctx.db.query("orders").collect();
    const accounts = await ctx.db.query("accounts").collect();
    const names = new Map(accounts.map((a) => [a._id, a.username]));
    return orders
      .map((order) => ({
        ...order,
        username: names.get(order.accountId) ?? "کاربر حذف شده",
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const ORDER_STATUSES = [
  "در حال پردازش",
  "ارسال شده",
  "تحویل داده شده",
  "لغو شده",
];

/** تغییر وضعیت سفارش توسط مدیر */
export const setOrderStatus = mutation({
  args: {
    token: v.string(),
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, { token, orderId, status }) => {
    await requireOwner(ctx, token);
    if (!ORDER_STATUSES.includes(status)) {
      throw new Error("وضعیت سفارش نامعتبر است.");
    }
    await ctx.db.patch(orderId, { status });
  },
});
