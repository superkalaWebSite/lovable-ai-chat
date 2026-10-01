const KEY = "supercala_support_seen";

let seenAt =
  typeof window !== "undefined"
    ? Number(localStorage.getItem(KEY) ?? "0") || 0
    : 0;

const listeners = new Set<() => void>();

export function getSupportSeenAt(): number {
  return seenAt;
}

export function subscribeSupportSeen(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** وقتی کاربر صفحه پشتیبانی را می‌بیند، پیام‌های خوانده‌شده علامت نمی‌خورند */
export function markSupportSeen() {
  const next = Date.now();
  if (next === seenAt) return;
  seenAt = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, String(seenAt));
  }
  listeners.forEach((listener) => listener());
}
