import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { friendlyError } from "@/lib/crypto";
import { getToken } from "@/lib/session";
import { formatDate } from "@/lib/shop";
import { useMutation, useQuery } from "convex/react";
import {
  Heart,
  Loader2,
  MessageSquare,
  PenLine,
  Star,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function ReviewsPage() {
  const { isAuthenticated, canLike, user } = useAuth();
  const reviews = useQuery(api.reviews.list);
  const addMutation = useMutation(api.reviews.add);
  const likeMutation = useMutation(api.reviews.toggleLike);

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (text.trim().length < 5) {
      toast.error("متن نظر را کامل بنویسید (حداقل ۵ حرف).");
      return;
    }
    setBusy(true);
    try {
      await addMutation({ token: getToken(), rating, text });
      setText("");
      setRating(5);
      toast.success("نظرت ثبت شد — ممنونیم! 🌱");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  /** لایک/برداشتن لایک نظر — فقط پشتیبانی و مدیران */
  const toggleLike = async (reviewId: Id<"reviews">) => {
    try {
      await likeMutation({ token: getToken(), reviewId });
    } catch (error) {
      toast.error(friendlyError(error));
    }
  };

  const likeCount = (review: { likedBy?: Id<"accounts">[] }) =>
    (review.likedBy ?? []).length;
  const isLiked = (review: { likedBy?: Id<"accounts">[] }) =>
    !!user && (review.likedBy ?? []).includes(user._id);

  /** آیا مدیر ثبت نظر این کاربر را غیرفعال کرده است؟ */
  const bannedUntil = user?.reviewBannedUntil ?? 0;
  const reviewBanned = bannedUntil > Date.now();
  const bannedDaysLeft = reviewBanned
    ? Math.ceil((bannedUntil - Date.now()) / 86400000)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageSquare className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">نظرات کاربران</h1>
          <p className="text-sm text-muted-foreground">
            {reviews === undefined
              ? "در حال بارگذاری..."
              : `${reviews.length.toLocaleString("fa-IR")} نظر ثبت شده`}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[340px_1fr]">
        {/* فرم ثبت نظر */}
        <Card className="rounded-2xl border-border/70 shadow-sm lg:sticky lg:top-40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PenLine className="size-4 text-primary" /> نظر تو چیه؟
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAuthenticated && reviewBanned ? (
              <div className="text-center">
                <span className="text-4xl">🚫</span>
                <h3 className="mt-3 font-black">ثبت نظر برای شما غیرفعال است</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  مدیر سایت ثبت نظر حساب شما را{" "}
                  {bannedDaysLeft > 3000
                    ? "به‌صورت همیشگی"
                    : `تا ${Math.max(1, bannedDaysLeft).toLocaleString("fa-IR")} روز دیگر`}{" "}
                  غیرفعال کرده است. اگر فکر می‌کنید اشتباه شده، از گپ پشتیبانی
                  پیام بدهید.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 w-full rounded-xl"
                  asChild
                >
                  <Link to="/support">پیام به پشتیبانی</Link>
                </Button>
              </div>
            ) : isAuthenticated ? (
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label>امتیاز شما</Label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          aria-label={`${value} ستاره`}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`size-7 ${
                              value <= rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-text">متن نظر</Label>
                  <Textarea
                    id="review-text"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="تجربه‌ات از خرید از سوپر کالا رو بنویس..."
                    rows={5}
                    maxLength={600}
                    disabled={busy}
                  />
                  <p className="text-xs text-muted-foreground">
                    {text.length.toLocaleString("fa-IR")} از ۶۰۰ کاراکتر
                  </p>
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full gap-2 rounded-xl"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> در حال ارسال...
                    </>
                  ) : (
                    <>ثبت نظر</>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center">
                <span className="text-4xl">✍️</span>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  برای ثبت نظر اول وارد حساب کاربریات شو.
                </p>
                <Button className="mt-4 w-full rounded-xl" asChild>
                  <Link to="/auth?returnTo=/reviews">ورود | ثبت‌نام</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* لیست نظرات */}
        <div className="space-y-3">
          {reviews === undefined ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 py-16 text-center">
              <span className="text-5xl">💬</span>
              <h3 className="mt-3 font-black">هنوز نظری ثبت نشده</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                اولین نفری باش که نظرش رو می‌ذاره!
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <Card
                key={review._id}
                className="rounded-2xl border-border/70 shadow-sm"
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-black text-primary">
                      {review.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">
                        {review.name}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <span className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className={`size-3.5 ${
                                starIndex < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                          ))}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    {review.accountId && (
                      <UserRound className="size-4 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    «{review.text}»
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        likeCount(review) > 0
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      ❤️ {likeCount(review).toLocaleString("fa-IR")}
                      {likeCount(review) > 0 && " — پشتیبانی دیده ✓"}
                    </span>
                    {canLike && (
                      <Button
                        type="button"
                        size="sm"
                        variant={isLiked(review) ? "default" : "outline"}
                        className="h-8 gap-1 rounded-full px-3 text-xs"
                        title="لایک نظر تا کاربر حس دیده شدن کند"
                        onClick={() => void toggleLike(review._id)}
                      >
                        <Heart className="size-3.5" />
                        {isLiked(review) ? "لایک شد" : "لایک کن"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
