/** هش SHA-256 به صورت hex — برای رمز عبور بدون ارسال متن ساده */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** تصادفی برای salt هر حساب کاربری */
export function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** پیام خطاهای Convex را ساده و فارسی می‌کند */
export function friendlyError(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "خطای ناشناخته‌ای رخ داد.";
  return raw
    .replace(/^Uncaught Error:\s*/i, "")
    .replace(/^Error:\s*/i, "")
    .replace(/^Server Error:\s*/i, "")
    .split("\n")[0]
    .trim();
}
