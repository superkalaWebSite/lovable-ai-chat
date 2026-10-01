import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      <span className="text-7xl">🧺</span>
      <h1 className="mt-6 text-5xl font-black text-primary">۴۰۴</h1>
      <p className="mt-3 text-lg font-bold">صفحه پیدا نشد!</p>
      <p className="mt-1 max-w-sm text-sm leading-7 text-muted-foreground">
        ممکن است آدرس را اشتباه تایپ کرده باشی یا این صفحه جابه‌جا شده باشد.
      </p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link to="/">بازگشت به صفحه اصلی</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/shop">رفتن به فروشگاه</Link>
        </Button>
      </div>
    </motion.div>
  );
}
