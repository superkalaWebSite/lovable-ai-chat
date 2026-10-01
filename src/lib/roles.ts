/** مقام‌های کاربران سوپر کالا (هم‌نام با مقدار role در دیتابیس) */
export const ACCOUNT_ROLES = [
  {
    value: "user",
    label: "کاربر",
    emoji: "🙂",
    tone: "bg-muted text-foreground/80",
    hint: "حساب عادی فروشگاه",
  },
  {
    value: "supervisor",
    label: "دستیابی",
    emoji: "🛡️",
    tone: "bg-sky-100 text-sky-700",
    hint: "ناظر پشتیبانی و سفارش‌ها",
  },
  {
    value: "admin",
    label: "ادمین",
    emoji: "👑",
    tone: "bg-primary/10 text-primary",
    hint: "دسترسی کامل به پنل کنترل سایت",
  },
  {
    value: "partner",
    label: "شریک مدیر",
    emoji: "🤝",
    tone: "bg-amber-100 text-amber-800",
    hint: "بالاترین مقام، مثل مالک سایت",
  },
] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number]["value"];

export function roleInfo(role: string) {
  return ACCOUNT_ROLES.find((item) => item.value === role) ?? ACCOUNT_ROLES[0];
}
