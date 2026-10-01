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
    label: "پشتیبانی",
    emoji: "🎧",
    tone: "bg-sky-100 text-sky-700",
    hint: "مسئول گفتگوی پشتیبانی با کاربران",
  },
  {
    value: "admin",
    label: "ادمین",
    emoji: "🧑‍💻",
    tone: "bg-primary/10 text-primary",
    hint: "مدیریت کالاها، مجازات و گپ کاربران",
  },
  {
    value: "partner",
    label: "مالک سایت",
    emoji: "👑",
    tone: "bg-amber-100 text-amber-800",
    hint: "بالاترین مقام سایت؛ دسترسی کامل و قابل‌برداشتن نیست",
  },
] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number]["value"];

/** نام کاربری رزروشده مالک سایت (هم‌نام با مقدار بک‌اند) */
export const OWNER_USERNAME = "کیان دریاباری";

export function roleInfo(role: string) {
  return ACCOUNT_ROLES.find((item) => item.value === role) ?? ACCOUNT_ROLES[0];
}

/** یک حساب مالک سایت است اگر نقش شریک مدیر داشته باشد یا نام‌کاربری رزروشده باشد */
export function isOwnerAccountInfo(account: {
  role: string;
  username: string;
}): boolean {
  return account.role === "partner" || account.username === OWNER_USERNAME;
}

/** اطلاعات نقش با در نظر گرفتن مالک سایت (برای نمایش در پروفایل، هدر و پنل) */
export function roleInfoFor(account: {
  role: string;
  username: string;
}) {
  return isOwnerAccountInfo(account)
    ? ACCOUNT_ROLES[3]
    : roleInfo(account.role);
}