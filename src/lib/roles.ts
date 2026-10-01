/**
 * مقام‌های کاربران سوپر کالا.
 * فقط سه مقام قابل‌تعیین است: کاربر، پشتیبانی و ادمین.
 * «مدیر سایت» مقامِ جداگانه‌ی دیتابیس نیست؛ فقط حساب رزروشده آن است.
 */
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
    label: "پشتیبانی",
    emoji: "🎧",
    tone: "bg-sky-100 text-sky-700",
    hint: "پاسخ به گپ کاربران در پنل کنترل",
  },
  {
    value: "admin",
    label: "ادمین",
    emoji: "🧑‍💻",
    tone: "bg-primary/10 text-primary",
    hint: "مدیریت کالاها، مجازات و گپ کاربران",
  },
] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number]["value"];

/** رتبه‌ی هر مقام — هیچ‌کس نمی‌تواند بالاتر از رتبه‌ی خودش مقام بدهد */
export const ROLE_RANK: Record<string, number> = {
  user: 0,
  supervisor: 1,
  admin: 2,
};

/** نام کاربری رزروشده مدیر سایت (هم‌نام با مقدار بک‌اند) */
export const OWNER_USERNAME = "کیان دریاباری";

/** مشخصات نمایشی مدیر سایت */
export const OWNER_ROLE = {
  label: "مدیر سایت",
  emoji: "👑",
  tone: "bg-amber-100 text-amber-800",
  hint: "بالاترین مقام سایت؛ دسترسی کامل و غیرقابل تغییر",
};

export function roleInfo(role: string) {
  return ACCOUNT_ROLES.find((item) => item.value === role) ?? ACCOUNT_ROLES[0];
}

/** فقط حساب رزروشده، مدیر سایت است */
export function isOwnerAccountInfo(account: { username: string }): boolean {
  return account.username === OWNER_USERNAME;
}

/** اطلاعات نقش برای نمایش (مدیر سایت جدا نمایش داده می‌شود) */
export function roleInfoFor(account: { role: string; username: string }) {
  return isOwnerAccountInfo(account) ? OWNER_ROLE : roleInfo(account.role);
}