import type { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAddToCart } from "@/hooks/use-cart";
import {
  categoryTile,
  discountPercent,
  formatPrice,
} from "@/lib/shop";
import { Package, ShoppingCart, Star, Truck } from "lucide-react";

export function ProductDialog({
  product,
  onClose,
}: {
  product: Doc<"products"> | null;
  onClose: () => void;
}) {
  const addToCart = useAddToCart();

  return (
    <Dialog open={product !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {product && (
          <>
            <DialogHeader>
              <DialogTitle className="leading-8">{product.title}</DialogTitle>
              <DialogDescription>
                {product.brand} — دسته {product.category}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 sm:grid-cols-2">
              <div
                className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${categoryTile(product.category)}`}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-8xl">{product.emoji}</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {product.rating.toLocaleString("fa-IR")} از ۵
                  </Badge>
                  <Badge variant="outline">
                    موجودی: {product.stock.toLocaleString("fa-IR")}
                  </Badge>
                  {discountPercent(product.price, product.oldPrice) > 0 && (
                    <Badge className="bg-primary text-primary-foreground">
                      {discountPercent(product.price, product.oldPrice).toLocaleString("fa-IR")}
                      ٪ تخفیف
                    </Badge>
                  )}
                </div>

                <div className="rounded-xl bg-muted p-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm font-bold text-primary">تومان</span>
                  </div>
                  {product.oldPrice !== undefined && product.oldPrice > product.price && (
                    <p className="text-xs text-muted-foreground">
                      قیمت قبل:{" "}
                      <span className="line-through">
                        {formatPrice(product.oldPrice)} تومان
                      </span>
                    </p>
                  )}
                </div>

                <p className="text-sm leading-7 text-muted-foreground">
                  {product.description}
                </p>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Truck className="size-4 text-primary" /> ارسال سریع طی ۱ تا ۳ روز کاری
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Package className="size-4 text-primary" /> ضمانت اصالت و سلامت کالا
                  </p>
                </div>

                <Separator />

                <Button
                  size="lg"
                  className="w-full gap-2 rounded-xl"
                  disabled={product.stock < 1}
                  onClick={() => void addToCart(product._id)}
                >
                  <ShoppingCart className="size-4" />
                  {product.stock < 1 ? "ناموجود" : "افزودن به سبد خرید"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
