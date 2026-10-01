import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { categoryTile, discountPercent, formatPrice } from "@/lib/shop";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";

export function ProductCard({
  product,
  onOpen,
}: {
  product: Doc<"products">;
  onOpen: (product: Doc<"products">) => void;
}) {
  const addToCart = useAddToCart();
  const off = discountPercent(product.price, product.oldPrice);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="text-start"
        aria-label={`مشاهده ${product.title}`}
      >
        <div
          className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${categoryTile(product.category)}`}
        >
          <span className="text-6xl transition-transform duration-300 group-hover:scale-110">
            {product.emoji}
          </span>
          {off > 0 && (
            <span className="absolute top-3 start-3 rounded-full bg-primary px-2 py-0.5 text-xs font-black text-primary-foreground shadow">
              {off.toLocaleString("fa-IR")}٪ تخفیف
            </span>
          )}
          {product.badge && (
            <span className="absolute bottom-3 end-3 rounded-full bg-foreground/90 px-2 py-0.5 text-[11px] font-bold text-white">
              {product.badge}
            </span>
          )}
        </div>

        <div className="space-y-2 p-4">
          <p className="text-xs text-muted-foreground">
            {product.brand} · {product.category}
          </p>
          <h3 className="line-clamp-2 min-h-11 text-sm font-medium leading-6">
            {product.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating.toLocaleString("fa-IR")}</span>
            <span className="ms-auto">
              {product.stock < 1 ? (
                <span className="font-medium text-destructive">ناموجود</span>
              ) : product.stock <= 5 ? (
                <span className="font-medium text-amber-600">
                  تنها {product.stock.toLocaleString("fa-IR")} عدد
                </span>
              ) : (
                <span className="text-emerald-600">موجود در انبار</span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-black text-primary">
              {formatPrice(product.price)}{" "}
              <span className="text-xs font-bold">تومان</span>
            </span>
            {product.oldPrice !== undefined && product.oldPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </button>

      <div className="mt-auto p-4 pt-0">
        <Button
          className="w-full gap-2 rounded-xl"
          disabled={product.stock < 1}
          onClick={() => void addToCart(product._id)}
        >
          <ShoppingCart className="size-4" />
          {product.stock < 1 ? "ناموجود" : "افزودن به سبد خرید"}
        </Button>
      </div>
    </motion.div>
  );
}
