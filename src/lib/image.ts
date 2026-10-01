/**
 * تبدیل فایل عکس انتخاب شده به data-url فشرده (مناسب ذخیره در Convex)
 * - حداکثر ابعاد ۹۰۰ پیکسل
 * - خروجی JPEG با کیفیت ۸۲٪ (معمولا زیر ۱۵۰ کیلوبایت)
 */
export async function fileToDataUrl(
  file: File,
  maxSize = 900,
  quality = 0.82,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("فقط فایل عکس مجاز است.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("حجم عکس نباید بیشتر از ۸ مگابایت باشد.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("خواندن فایل ممکن نشد."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("عکس قابل پردازش نیست."));
    element.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  // پس‌زمینه سفید تا حجم خروجی JPEG کوچک بماند
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}
