import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { friendlyError } from "@/lib/crypto";
import { getToken } from "@/lib/session";
import { useMutation } from "convex/react";
import { useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "./use-auth";

type LikeableReview = { likedBy?: Id<"accounts">[] };

/**
 * لایک نظر — فقط پشتیبانی و مدیران اجازه لایک کردن دارند تا کاربر حس دیده شدن کند.
 * این هوک در صفحه نظرات و صفحه اصلی مشترک است.
 */
export function useReviewLikes() {
  const { canLike, user } = useAuth();
  const likeMutation = useMutation(api.reviews.toggleLike);

  const likeCount = (review: LikeableReview) => (review.likedBy ?? []).length;

  const isLiked = (review: LikeableReview) =>
    !!user && (review.likedBy ?? []).includes(user._id);

  const toggleLike = useCallback(
    async (reviewId: Id<"reviews">) => {
      try {
        await likeMutation({ token: getToken(), reviewId });
      } catch (error) {
        toast.error(friendlyError(error));
      }
    },
    [likeMutation],
  );

  return { canLike, likeCount, isLiked, toggleLike };
}