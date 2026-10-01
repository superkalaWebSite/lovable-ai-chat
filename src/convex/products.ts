import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./helpers";

const productArgs = {
  title: v.string(),
  brand: v.string(),
  category: v.string(),
  emoji: v.string(),
  price: v.number(),
  oldPrice: v.optional(v.number()),
  rating: v.number(),
  stock: v.number(),
  description: v.string(),
  badge: v.optional(v.string()),
};

type SeedProduct = {
  title: string;
  brand: string;
  category: string;
  emoji: string;
  price: number;
  oldPrice?: number;
  rating: number;
  stock: number;
  description: string;
  badge?: string;
};

const SEED_PRODUCTS: SeedProduct[] = [
  // موبایل و تبلت
  {
    title: "گوشی موبایل سامسونگ گلکسی A55 5G",
    brand: "سامسونگ",
    category: "موبایل و تبلت",
    emoji: "📱",
    price: 18990000,
    oldPrice: 20490000,
    rating: 4.6,
    stock: 24,
    description:
      "نمایشگر Super AMOLED با نرخ نوسان ۱۲۰ هرتز، دوربین ۵۰ مگاپیکسلی و باتری ۵۰۰۰ میلی‌آمپر ساعت. مناسب استفاده روزمره و بازی.",
    badge: "پرفروش",
  },
  {
    title: "گوشی موبایل شیائومی ردمی نوت ۱۳ پرو",
    brand: "شیائومی",
    category: "موبایل و تبلت",
    emoji: "📱",
    price: 12490000,
    oldPrice: 13990000,
    rating: 4.5,
    stock: 40,
    description:
      "دوربین ۲۰۰ مگاپیکسلی، شارژ سریع ۶۷ وات و صفحه‌نمایش ۶.۶۷ اینچی. بهترین نسبت قیمت به امکانات در رده میانی.",
    badge: "تخفیف ویژه",
  },
  {
    title: "گوشی موبایل اپل آیفون ۱۳",
    brand: "اپل",
    category: "موبایل و تبلت",
    emoji: "📲",
    price: 32990000,
    oldPrice: 34990000,
    rating: 4.8,
    stock: 9,
    description:
      "چیپ A15 Bionic، نمایشگر OLED فوق‌العاده روشن و دوربین دوگانه حرفه‌ای. پشتیبانی نرم‌افزاری طولانی مدت اپل.",
  },
  {
    title: "تبلت سامسونگ گلکسی Tab A9",
    brand: "سامسونگ",
    category: "موبایل و تبلت",
    emoji: "📲",
    price: 10990000,
    rating: 4.4,
    stock: 16,
    description:
      "تبلت ۸.۷ اینچی مناسب تماشای فیلم، مطالعه و کلاس آنلاین، با بلندگوهای دوگانه و باتری طولانی.",
  },

  // لپتاپ و کامپیوتر
  {
    title: "لپتاپ ایسوس VivoBook 15",
    brand: "ایسوس",
    category: "لپتاپ و کامپیوتر",
    emoji: "💻",
    price: 34500000,
    oldPrice: 36900000,
    rating: 4.5,
    stock: 11,
    description:
      "پردازنده Core i5 نسل ۱۳، رم ۱۶ گیگابایت و حافظه SSD ۵۱۲ گیگ. سبک، خوش‌ساخت و مناسب دانشجویان و کارهای اداری.",
    badge: "پرفروش",
  },
  {
    title: "لپتاپ اپل MacBook Air M2",
    brand: "اپل",
    category: "لپتاپ و کامپیوتر",
    emoji: "💻",
    price: 68900000,
    rating: 4.9,
    stock: 5,
    description:
      "تراشه M2، نمایشگر ۱۳.۶ اینچی Liquid Retina و تا ۱۸ ساعت شارژدهی. بدون فن، کاملاً بی‌صدا و فوق‌العاده سبک.",
    badge: "جدید",
  },
  {
    title: "مانیتور سامسونگ ۲۷ اینچ منحنی",
    brand: "سامسونگ",
    category: "لپتاپ و کامپیوتر",
    emoji: "🖥️",
    price: 9800000,
    oldPrice: 10900000,
    rating: 4.6,
    stock: 14,
    description:
      "پنل IPS با وضوح QHD، نرخ نوسان ۱۰۰ هرتز و زمان پاسخ‌گویی ۴ میلی‌ثانیه؛ عالی برای کار و بازی.",
  },
  {
    title: "کیبورد مکانیکال ریزر BlackWidow",
    brand: "ریزر",
    category: "لپتاپ و کامپیوتر",
    emoji: "⌨️",
    price: 3250000,
    oldPrice: 3800000,
    rating: 4.7,
    stock: 26,
    description:
      "سوییچ‌های سبز خطی و نرم، نورپردازی Chroma و بدنه آلومینیومی. تجربه تایپ و بازی در سطح حرفه‌ای.",
  },

  // لوازم جانبی
  {
    title: "هدفون بی‌سیم سونی WH-1000XM5",
    brand: "سونی",
    category: "لوازم جانبی",
    emoji: "🎧",
    price: 19800000,
    oldPrice: 21500000,
    rating: 4.9,
    stock: 12,
    description:
      "بهترین نویز کنسلینگ در کلاس خود، ۳۰ ساعت پخش موسیقی و کیفیت صدای Hi-Res. مناسب پرواز، کار و مسیر روزانه.",
    badge: "بهترین کیفیت",
  },
  {
    title: "ساعت هوشمند اپل واچ سری ۹",
    brand: "اپل",
    category: "لوازم جانبی",
    emoji: "⌚",
    price: 24500000,
    rating: 4.8,
    stock: 7,
    description:
      "نمایشگر همیشه‌روشن، سنسورهای سلامتی کامل و تعامل با یک ضربه. بهترین ساعت هوشمند برای آیفون.",
    badge: "جدید",
  },
  {
    title: "پاوربانک انکر ۲۰۰۰۰ میلی‌آمپر",
    brand: "انکر",
    category: "لوازم جانبی",
    emoji: "🔋",
    price: 1450000,
    oldPrice: 1690000,
    rating: 4.6,
    stock: 55,
    description:
      "شارژ سریع ۲۲.۵ وات، نمایشگر دیجیتال شارژ و بدنه مقاوم. دو شارژ کامل برای گوشی هوشمند در یک روز پرمشغله.",
  },
  {
    title: "اسپیکر بلوتوثی JBL Flip 6",
    brand: "JBL",
    category: "لوازم جانبی",
    emoji: "🔊",
    price: 2890000,
    oldPrice: 3200000,
    rating: 4.5,
    stock: 22,
    description:
      "صدای قدرتمند با باس عمیق، ضدآب IP67 و ۱۲ ساعت پخش. همراه طبیعی پیک‌نیک و سفر.",
  },

  // خانه و آشپزخانه
  {
    title: "قهوه‌ساز برقی فیلیپس",
    brand: "فیلیپس",
    category: "خانه و آشپزخانه",
    emoji: "☕",
    price: 4150000,
    oldPrice: 4700000,
    rating: 4.4,
    stock: 19,
    description:
      "دم‌آوری قهوه اسپرسو و فیلتر با فشار ۱۵ بار، مخزن ۱.۲ لیتری و سیستم بخار برای کف شیر.",
    badge: "تخفیف ویژه",
  },
  {
    title: "چای‌ساز تفال با قوری شیشه‌ای",
    brand: "تفال",
    category: "خانه و آشپزخانه",
    emoji: "🫖",
    price: 3290000,
    rating: 4.5,
    stock: 21,
    description:
      "کتری استیل ضدزنگ با چراغ نشانگر، قوری شیشه‌ای مقاوم و صفحه گرم‌کننده برای سرو چای داغ.",
  },
  {
    title: "جاروبرقی رباتیک شیائومی",
    brand: "شیائومی",
    category: "خانه و آشپزخانه",
    emoji: "🤖",
    price: 15900000,
    oldPrice: 17500000,
    rating: 4.6,
    stock: 8,
    description:
      "نقشه‌برداری لیزری، جارو و تی‌هم زمان، کنترل از طریق اپلیکیشن و شارژ خودکار. خانه‌ای همیشه تمیز.",
    badge: "جدید",
  },
  {
    title: "سرویس قابلمه ۸ پارچه گرانیتی",
    brand: "اکسسوری آشپزخانه",
    category: "خانه و آشپزخانه",
    emoji: "🍳",
    price: 5600000,
    rating: 4.2,
    stock: 15,
    description:
      "روکش گرانیتی نچسب، مناسب انواع اجاق‌ها شامل شعله پخش‌کن، درجه‌دار و مقاوم در برابر خش.",
  },
  {
    title: "پنکه سقفی بی‌صدا",
    brand: "اسنوا",
    category: "خانه و آشپزخانه",
    emoji: "🌀",
    price: 2750000,
    oldPrice: 3100000,
    rating: 4.3,
    stock: 30,
    description:
      "سه سرعت با ریموت کنترل، موتور کم‌مصرف و بی‌صدا؛ پوشش دهی هوای خنک در اتاق‌های بزرگ.",
  },

  // پوشاک
  {
    title: "کتانی نایکی ایرمکس",
    brand: "نایکی",
    category: "پوشاک",
    emoji: "👟",
    price: 8900000,
    oldPrice: 9800000,
    rating: 4.7,
    stock: 25,
    description:
      "زیره هوای مقاوم و رویه مش تنفس‌پذیر؛ راحتی تمام‌روز برای پیاده‌روی، ورزش و استایل روزمره.",
    badge: "پرفروش",
  },
  {
    title: "هودی مردانه کلاسیک",
    brand: "سوپر کالا",
    category: "پوشاک",
    emoji: "👕",
    price: 1290000,
    oldPrice: 1590000,
    rating: 4.4,
    stock: 44,
    description:
      "پارچه فریس نرم با آستر داخلی، کلاه دو لایه و جیب کانگوری؛ مناسب فصل پاییز و زمستان.",
  },
  {
    title: "کیف دوشی چرم طبیعی",
    brand: "سوپر کالا",
    category: "پوشاک",
    emoji: "👜",
    price: 2150000,
    rating: 4.5,
    stock: 17,
    description:
      "چرم طبیعی گاوی با دوخت دست، بند قابل تنظیم و جیب‌های متعدد برای موبایل، کارت و کیف پول.",
  },
  {
    title: "کلاه کپ ورزشی",
    brand: "آدیداس",
    category: "پوشاک",
    emoji: "🧢",
    price: 490000,
    oldPrice: 590000,
    rating: 4.3,
    stock: 60,
    description:
      "رویه نخی تنفس‌پذیر با قفل پشتی قابل تنظیم؛ محافظت از صورت در برابر آفتاب با استایل اسپرت.",
  },

  // ورزشی
  {
    title: "توپ فوتبال آدیداس استاندارد",
    brand: "آدیداس",
    category: "ورزشی",
    emoji: "⚽",
    price: 1150000,
    oldPrice: 1350000,
    rating: 4.6,
    stock: 33,
    description:
      "دوخت مقاوم و رویه TPU مناسب زمین چمن و خاک؛ پرواز ثابت و ماندگاری بالا.",
  },
  {
    title: "دمبل ۵ کیلوگرمی (جفت)",
    brand: "پاور‌فورم",
    category: "ورزشی",
    emoji: "🏋️",
    price: 980000,
    rating: 4.5,
    stock: 28,
    description:
      "پوشش لاستیکی ضدضربه برای تمرینات قدرتی خانگی؛ مناسب مچ، بازو و تمرینات سبک هوازی.",
  },
  {
    title: "بطری آب ورزشی ۷۵۰ میلی",
    brand: "سوپر کالا",
    category: "ورزشی",
    emoji: "🥤",
    price: 350000,
    oldPrice: 420000,
    rating: 4.2,
    stock: 70,
    description:
      "بدنه BPA-free با درب ضدنشت و نشانگر حجم؛ سبک و مقاوم برای باشگاه، کوهنوردی و دویدن.",
  },

  // آرایشی و بهداشتی
  {
    title: "عطر مردانه دیور ساواج",
    brand: "دیور",
    category: "آرایشی و بهداشتی",
    emoji: "🌿",
    price: 8400000,
    oldPrice: 9200000,
    rating: 4.9,
    stock: 13,
    description:
      "رایحه تند و چوبی با ماندگاری بالا؛ انتخابی کلاسیک و مطمئن برای موقعیت‌های رسمی و روزمره.",
    badge: "پرفروش",
  },
  {
    title: "کرم مرطوب‌کننده لورال",
    brand: "لورال",
    category: "آرایشی و بهداشتی",
    emoji: "💧",
    price: 780000,
    oldPrice: 950000,
    rating: 4.4,
    stock: 48,
    description:
      "آبرسانی ۲۴ ساعته با اسید هیالورونیک، مناسب انواع پوست و زیر آرایش.",
  },
  {
    title: "رژلب مات ماندگار",
    brand: "مک",
    category: "آرایشی و بهداشتی",
    emoji: "💄",
    price: 520000,
    rating: 4.5,
    stock: 39,
    description:
      "بافت سبک و پوشش یکدست مات، مقاوم در برابر آب و غذا با رنگ‌های طبیعی.",
  },

  // کتاب و اسباب‌بازی
  {
    title: "مجموعه کتاب‌های شاهنامه فردوسی",
    brand: "انتشارات سخن",
    category: "کتاب و اسباب‌بازی",
    emoji: "📚",
    price: 680000,
    rating: 4.8,
    stock: 20,
    description:
      "چاپ نفیس شش‌جلدی با تصحیح معتبر و جلد گالینگور؛ هدیه‌ای ارزشمند برای دوستداران ادبیات فارسی.",
  },
  {
    title: "ماکت لگو شهر",
    brand: "لگو",
    category: "کتاب و اسباب‌بازی",
    emoji: "🧱",
    price: 3450000,
    oldPrice: 3900000,
    rating: 4.7,
    stock: 10,
    description:
      "۱۲۰۰ قطعه با جزئیات کامل؛ تقویت خلاقیت و تمرکز برای کودکان بالای ۸ سال و بزرگسالان.",
  },
  {
    title: "عروسک خرس پولیشی بزرگ",
    brand: "سوپر کالا",
    category: "کتاب و اسباب‌بازی",
    emoji: "🧸",
    price: 450000,
    oldPrice: 550000,
    rating: 4.3,
    stock: 35,
    description:
      "پولیش نرم و ضدحساسیت با ارتفاع ۶۰ سانتی‌متر؛ همراه دوست‌داشتنی کودکان و هدیه خاص.",
  },
];

/** لیست همه محصولات برای فروشگاه */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

/** افزودن محصول جدید (فقط مدیر) */
export const add = mutation({
  args: { token: v.string(), ...productArgs },
  handler: async (ctx, { token, ...product }) => {
    await requireAdmin(ctx, token);
    if (product.price < 0 || product.stock < 0) {
      throw new Error("قیمت و موجودی نمی‌توانند منفی باشند.");
    }
    await ctx.db.insert("products", product);
  },
});

/** ویرایش محصول (فقط مدیر) */
export const update = mutation({
  args: { token: v.string(), id: v.id("products"), ...productArgs },
  handler: async (ctx, { token, id, ...product }) => {
    await requireAdmin(ctx, token);
    if (product.price < 0 || product.stock < 0) {
      throw new Error("قیمت و موجودی نمی‌توانند منفی باشند.");
    }
    await ctx.db.patch(id, product);
  },
});

/** حذف محصول (فقط مدیر) */
export const remove = mutation({
  args: { token: v.string(), id: v.id("products") },
  handler: async (ctx, { token, id }) => {
    await requireAdmin(ctx, token);
    await ctx.db.delete(id);
    const carts = await ctx.db.query("cartItems").collect();
    for (const item of carts) {
      if (item.productId === id) await ctx.db.delete(item._id);
    }
  },
});

/** ساخت محصولات نمونه در اولین اجرا */
export const seedIfEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").first();
    if (existing) return;
    for (const p of SEED_PRODUCTS) {
      await ctx.db.insert("products", p);
    }
  },
});
