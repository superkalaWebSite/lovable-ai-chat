import logo from "@/assets/logo.svg";
import { CATEGORIES } from "@/lib/shop";
import { HeartHandshake, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-foreground text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="سوپر کالا" className="size-9 rounded-xl" />
            <span className="text-lg font-black text-white">
              سوپر <span className="text-red-400">کالا</span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-7 text-white/60">
            فروشگاه اینترنتی سوپر کالا؛ خرید مطمئن با ضمانت اصالت کالا،
            ارسال سریع به سراسر کشور و پشتیبانی واقعی.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
            <HeartHandshake className="size-4 text-red-400" />
            با افتخار در خدمت مشتری‌های عزیز
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold text-white">دسته‌بندی‌ها</h3>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIES.slice(0, 6).map((category) => (
              <li key={category.name}>
                <Link
                  to={`/shop?cat=${encodeURIComponent(category.name)}`}
                  className="text-white/60 transition-colors hover:text-red-400"
                >
                  {category.emoji} {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold text-white">دسترسی سریع</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/shop" className="text-white/60 transition-colors hover:text-red-400">
                فروشگاه
              </Link>
            </li>
            <li>
              <Link to="/cart" className="text-white/60 transition-colors hover:text-red-400">
                سبد خرید
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-white/60 transition-colors hover:text-red-400">
                پروفایل من
              </Link>
            </li>
            <li>
              <Link to="/support" className="text-white/60 transition-colors hover:text-red-400">
                گپ با پشتیبانی
              </Link>
            </li>
            <li>
              <Link to="/auth" className="text-white/60 transition-colors hover:text-red-400">
                ورود / ثبت‌نام
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold text-white">راهنمای تماس</h3>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-red-400" />
              ۰۲۱-۹۱۰۰۱۲۳۴
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-red-400" />
              پشتیبانی آنلاین ۲۴ ساعته
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-red-400" />
              تهران، خیابان آزادی، پاساژ سوپر کالا
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/50 sm:flex-row">
          <span>© ۱۴۰۴ سوپر کالا — تمامی حقوق محفوظ است.</span>
          <span>ساخته‌شده با ❤️ در Freebuff</span>
        </div>
      </div>
    </footer>
  );
}
