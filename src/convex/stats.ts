import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAdmin } from "./helpers";

/** آمار کلی برای پنل کنترل سایت */
export const adminStats = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    await requireAdmin(ctx, token);
    const products = await ctx.db.query("products").collect();
    const accounts = await ctx.db.query("accounts").collect();
    const orders = await ctx.db.query("orders").collect();
    const messages = await ctx.db.query("supportMessages").collect();
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const lowStock = products.filter((p) => p.stock <= 5).length;
    return {
      products: products.length,
      users: accounts.filter((a) => a.role === "user").length,
      orders: orders.length,
      messages: messages.length,
      revenue,
      lowStock,
    };
  },
});
