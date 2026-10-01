import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { friendlyError } from "@/lib/crypto";
import { formatTime } from "@/lib/shop";
import { markSupportSeen } from "@/lib/support-seen";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const QUICK_QUESTIONS = [
  "زمان ارسال سفارش چند روز است؟",
  "چطور کد رهگیری بگیرم؟",
  "اگر کالا معیوب بود چطوری مرجوع کنم؟",
];

export default function SupportPage() {
  const { token, user } = useAuth();
  const messages = useQuery(
    api.support.myThread,
    token ? { token } : "skip",
  );
  const sendMutation = useMutation(api.support.send);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages?.length]);

  // با دیدن صفحه، نشان اعلانِ پاسخ‌های پشتیبانی در هدر پاک می‌شود
  useEffect(() => {
    if (messages !== undefined) markSupportSeen();
  }, [messages]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = text.trim();
    if (!clean || busy) return;
    setBusy(true);
    try {
      await sendMutation({ token, text: clean });
      setText("");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-black">گپ با پشتیبانی</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            آنلاین — معمولا کمتر از ۱۰ دقیقه جواب می‌دهیم
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-md">
        {/* سربرگ گپ */}
        <div className="flex items-center gap-3 border-b border-border/60 bg-muted/50 px-4 py-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-foreground text-lg font-black text-white">
            🛎️
          </span>
          <div>
            <p className="text-sm font-black">پشتیبانی سوپر کالا</p>
            <p className="text-xs text-muted-foreground">
              پاسخ به سوالات خرید، ارسال و مرجوعی
            </p>
          </div>
        </div>

        {/* پیام‌ها */}
        <div className="flex max-h-[55vh] min-h-80 flex-col gap-3 overflow-y-auto p-4">
          {messages !== undefined && messages.length === 0 && (
            <div className="m-auto text-center">
              <span className="text-5xl">💬</span>
              <p className="mt-3 text-sm font-bold">هنوز پیامی رد و بدل نشده</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                سوالی داری؟ همینجا بنویس؛ مثلا درباره زمان ارسال یا مرجوعی کالا.
              </p>
            </div>
          )}

          {messages?.map((message) => {
            const mine = message.from === "user";
            return (
              <div
                key={message._id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-7 ${
                    mine
                      ? "rounded-ee-sm bg-primary text-primary-foreground"
                      : "rounded-es-sm bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                </div>
                <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                  {mine ? "شما" : "پشتیبانی"} · {formatTime(message.createdAt)}
                </span>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* پیشنهادهای سریع */}
        {messages !== undefined && messages.length === 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border/60 px-4 pt-3">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => setText(question)}
                className="rounded-full border border-border/70 bg-muted/60 px-3 py-1.5 text-xs transition-colors hover:border-primary/50 hover:text-primary"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {/* ورودی پیام */}
        <form onSubmit={submit} className="flex items-center gap-2 p-4">
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={
              user ? "پیام خود را بنویسید..." : "برای نوشتن پیام وارد شوید"
            }
            className="h-11 rounded-xl"
            maxLength={1000}
            disabled={busy}
          />
          <Button
            type="submit"
            size="icon"
            className="size-11 shrink-0 rounded-xl"
            disabled={busy || !text.trim()}
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4 -scale-x-100" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
