import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // ---------- سوپر کالا: accounts (login without email, name + password) ----------
    accounts: defineTable({
      username: v.string(),
      usernameLower: v.string(),
      salt: v.string(),
      passwordHash: v.string(),
      role: v.union(v.literal("admin"), v.literal("user")),
      createdAt: v.number(),
      // مجازات‌های مدیر (تا چه زمانی فعال است؛ 0 یا نداشتن = بدون مجازات)
      supportBannedUntil: v.optional(v.number()),
      discountBannedUntil: v.optional(v.number()),
    }).index("by_usernameLower", ["usernameLower"]),

    sessions: defineTable({
      token: v.string(),
      accountId: v.id("accounts"),
      createdAt: v.number(),
    })
      .index("by_token", ["token"])
      .index("by_account", ["accountId"]),

    products: defineTable({
      title: v.string(),
      brand: v.string(),
      category: v.string(),
      emoji: v.string(),
      image: v.optional(v.string()), // data-url عکس آپلود شده توسط مدیر
      price: v.number(),
      oldPrice: v.optional(v.number()),
      rating: v.number(),
      stock: v.number(),
      description: v.string(),
      badge: v.optional(v.string()),
    }).index("by_category", ["category"]),

    cartItems: defineTable({
      accountId: v.id("accounts"),
      productId: v.id("products"),
      qty: v.number(),
    }).index("by_account", ["accountId"]),

    orders: defineTable({
      accountId: v.id("accounts"),
      items: v.array(
        v.object({
          productId: v.id("products"),
          title: v.string(),
          emoji: v.string(),
          price: v.number(),
          qty: v.number(),
        }),
      ),
      total: v.number(),
      status: v.string(),
      createdAt: v.number(),
    }).index("by_account", ["accountId"]),

    supportMessages: defineTable({
      accountId: v.id("accounts"),
      text: v.string(),
      from: v.union(v.literal("user"), v.literal("admin")),
      createdAt: v.number(),
    }).index("by_account", ["accountId"]),

    reviews: defineTable({
      accountId: v.optional(v.id("accounts")),
      name: v.string(),
      rating: v.number(),
      text: v.string(),
      createdAt: v.number(),
    }).index("by_createdAt", ["createdAt"])
  },
  {
    schemaValidation: false,
  },
);

export default schema;
