import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { friendlyError } from "@/lib/crypto";
import { CATEGORIES, categoryTile, formatPrice, formatTime } from "@/lib/shop";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  Loader2,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  Send,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";

type Product = Doc<"products">;

export default function AdminPage() {
  const { user, token, isAdmin, isLoading } = useAuth();
  const stats = useQuery(
    api.stats.adminStats,
    token && isAdmin ? { token } : "skip",
  );
  const products = useQuery(api.products.list);
  const inbox = useQuery(
    api.support.adminInbox,
    token && isAdmin ? { token } : "skip",
  );

  const addMutation = useMutation(api.products.add);
  const updateMutation = useMutation(api.products.update);
  const removeMutation = useMutation(api.products.remove);
  const replyMutation = useMutation(api.support.adminReply);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  type InboxItem = NonNullable<typeof inbox>[number];
  const threads = useMemo(() => {
    const map = new Map<
      string,
      {
        accountId: InboxItem["accountId"];
        username: string;
        messages: InboxItem[];
      }
    >();
    for (const message of inbox ?? []) {
      const key = message.accountId as string;
      let thread = map.get(key);
      if (!thread) {
        thread = {
          accountId: message.accountId,
          username: message.username,
          messages: [],
        };
        map.set(key, thread);
      }
      thread.messages.push(message);
    }
    return [...map.values()].sort(
      (a, b) =>
        (b.messages[b.messages.length - 1]?.createdAt ?? 0) -
        (a.messages[a.messages.length - 1]?.createdAt ?? 0),
    );
  }, [inbox]);

  useEffect(() => {
    if (!activeUser && threads.length > 0) {
      setActiveUser(threads[0].accountId as string);
    }
  }, [threads, activeUser]);

  const activeThread =
    threads.find((thread) => thread.accountId === activeUser) ?? threads[0];

  // گپ‌هایی که آخرین پیامشان از کاربر است و هنوز جواب داده نشده
  const waitingCount = threads.filter((thread) => {
    const last = thread.messages[thread.messages.length - 1];
    return last?.from === "user";
  }).length;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Skeleton className="h-10 w-56 rounded-xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  const openNewProduct = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const submitProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    const price = Number(data.get("price"));
    const stock = Number(data.get("stock"));
    const oldPriceRaw = String(data.get("oldPrice") ?? "").trim();
    const badgeRaw = String(data.get("badge") ?? "").trim();

    if (title.length < 3) {
      toast.error("عنوان محصول را کامل بنویسید.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("قیمت معتبر وارد کنید.");
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      toast.error("موجودی معتبر وارد کنید.");
      return;
    }

    const payload = {
      title,
      brand: String(data.get("brand") ?? "").trim() || "سوپر کالا",
      category: String(data.get("category") ?? CATEGORIES[0].name),
      emoji: String(data.get("emoji") ?? "").trim() || "🛍️",
      price,
      oldPrice: oldPriceRaw ? Number(oldPriceRaw) : undefined,
      rating: Math.min(5, Math.max(0, Number(data.get("rating")) || 4.5)),
      stock,
      description: description || "محصول باکیفیت از فروشگاه سوپر کالا.",
      badge: badgeRaw || undefined,
    };

    setBusy(true);
    try {
      if (editing) {
        await updateMutation({ token, id: editing._id, ...payload });
        toast.success("محصول ویرایش شد ✏️");
      } else {
        await addMutation({ token, ...payload });
        toast.success("محصول اضافه شد 🎉");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await removeMutation({ token, id: deleting._id });
      toast.success(`«${deleting.title}» حذف شد`);
      setDeleting(null);
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeThread) return;
    const clean = reply.trim();
    if (!clean) return;
    setBusy(true);
    try {
      await replyMutation({
        token,
        accountId: activeThread.accountId,
        text: clean,
      });
      setReply("");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setBusy(false);
    }
  };

  const statCards = [
    {
      label: "تعداد محصولات",
      value: stats?.products ?? 0,
      icon: Package,
      tone: "bg-sky-100 text-sky-700",
    },
    {
      label: "کاربران ثبت‌نام شده",
      value: stats?.users ?? 0,
      icon: Users,
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "سفارش‌ها",
      value: stats?.orders ?? 0,
      icon: ShoppingCart,
      tone: "bg-violet-100 text-violet-700",
    },
    {
      label: "درآمد کل",
      value: formatPrice(stats?.revenue ?? 0),
      suffix: "تومان",
      icon: Wallet,
      tone: "bg-cyan-100 text-cyan-700",
    },
    {
      label: "پیام‌های پشتیبانی",
      value: stats?.messages ?? 0,
      icon: MessageCircle,
      tone: "bg-teal-100 text-teal-700",
    },
    {
      label: "کالای کم‌موجود (≤۵)",
      value: stats?.lowStock ?? 0,
      icon: AlertTriangle,
      tone: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* سربرگ */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-foreground text-green-400">
          <ShieldCheck className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">پنل کنترل سایت</h1>
          <p className="text-sm text-muted-foreground">
            خوش اومدی {user?.username} — مدیریت کالاها، گفتگوها و آمار سایت
          </p>
        </div>
        <Button className="ms-auto gap-2 rounded-xl" onClick={openNewProduct}>
          <Plus className="size-4" /> افزودن محصول
        </Button>
      </div>

      <Tabs defaultValue="stats" className="gap-6">
        <TabsList className="rounded-full">
          <TabsTrigger value="stats" className="rounded-full">
            📊 آمار سایت
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-full">
            📦 کنترل کالاها
          </TabsTrigger>
          <TabsTrigger value="chat" className="rounded-full">
            💬 گپ کاربران
            {waitingCount > 0 && (
              <span
                title={`${waitingCount.toLocaleString("fa-IR")} گپ بی‌جواب`}
                className="ms-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground"
              >
                {waitingCount.toLocaleString("fa-IR")}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ───── آمار ───── */}
        <TabsContent value="stats" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((card) => (
              <Card key={card.label} className="rounded-2xl border-border/70 shadow-sm">
                <CardContent className="flex items-center gap-4 p-5">
                  <span
                    className={`flex size-12 items-center justify-center rounded-2xl ${card.tone}`}
                  >
                    <card.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-xl font-black">
                      {card.value.toLocaleString("fa-IR")}
                      {card.suffix && (
                        <span className="ms-1 text-xs font-bold text-muted-foreground">
                          {card.suffix}
                        </span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="p-5 text-sm leading-7 text-muted-foreground">
              <b className="text-foreground">راهنما:</b> از تب «کنترل کالاها»
              می‌توانی محصول اضافه، ویرایش یا حذف کنی، و از تب «گپ کاربران»
              به پیام‌های مشتری‌ها جواب بدهی. تغییرات بلافاصله برای همه
              کاربرها نمایش داده می‌شود.
            </CardContent>
          </Card>
        </TabsContent>

        {/* ───── کالاها ───── */}
        <TabsContent value="products" className="mt-6">
          <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-5 py-3">
              <p className="text-sm font-black">
                موجودی کالاها ({(products ?? []).length.toLocaleString("fa-IR")}
                )
              </p>
              <Button size="sm" className="gap-1.5 rounded-lg" onClick={openNewProduct}>
                <Plus className="size-4" /> محصول جدید
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کالا</TableHead>
                    <TableHead>دسته‌بندی</TableHead>
                    <TableHead>قیمت</TableHead>
                    <TableHead>موجودی</TableHead>
                    <TableHead className="text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products === undefined ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-16 rounded-xl" />
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        هنوز محصولی ثبت نشده — اولین محصول را اضافه کن.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl ${categoryTile(
                                product.category,
                              )}`}
                            >
                              {product.emoji}
                            </span>
                            <span className="min-w-0">
                              <span className="block max-w-64 truncate text-sm font-bold">
                                {product.title}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {product.brand}
                              </span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatPrice(product.price)}
                          <span className="text-xs font-normal text-muted-foreground">
                            {" "}
                            تومان
                          </span>
                        </TableCell>
                        <TableCell>
                          {product.stock < 1 ? (
                            <Badge className="bg-destructive/10 text-destructive">
                              ناموجود
                            </Badge>
                          ) : product.stock <= 5 ? (
                            <Badge className="bg-amber-100 text-amber-700">
                              {product.stock.toLocaleString("fa-IR")} عدد
                            </Badge>
                          ) : (
                            <span className="text-sm">
                              {product.stock.toLocaleString("fa-IR")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              title="ویرایش"
                              onClick={() => openEditProduct(product)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:text-destructive"
                              title="حذف"
                              onClick={() => setDeleting(product)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* ───── گفتگوها ───── */}
        <TabsContent value="chat" className="mt-6">
          {threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 py-16 text-center">
              <span className="text-5xl">📭</span>
              <h3 className="mt-3 font-black">هنوز پیامی از کاربرها نیامده</h3>
              <p className="mt-1 max-w-sm text-sm leading-7 text-muted-foreground">
                وقتی کاربرها از صفحه «گپ پشتیبانی» پیامی بفرستند، اینجا نمایش
                داده می‌شود.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-[260px_1fr]">
              {/* لیست کاربرها */}
              <Card className="max-h-[520px] overflow-y-auto rounded-2xl border-border/70 p-2 shadow-sm">
                {threads.map((thread) => {
                  const last = thread.messages[thread.messages.length - 1];
                  const isActive = activeThread?.accountId === thread.accountId;
                  return (
                    <button
                      key={thread.accountId}
                      type="button"
                      onClick={() => setActiveUser(thread.accountId as string)}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-start transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-black text-white">
                        {thread.username.slice(0, 1)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">
                          {thread.username}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {last?.text}
                        </span>
                      </span>
                      {last?.from === "user" && (
                        <span
                          title="بدون جواب"
                          className="size-2.5 shrink-0 rounded-full bg-primary"
                        />
                      )}
                    </button>
                  );
                })}
              </Card>

              {/* مکالمه */}
              <Card className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border-border/70 shadow-sm">
                <div className="flex items-center gap-3 border-b border-border/60 bg-muted/50 px-4 py-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-sm font-black text-white">
                    {activeThread?.username.slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-sm font-black">
                      {activeThread?.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      کاربر سوپر کالا
                    </p>
                  </div>
                </div>

                <div className="flex max-h-[420px] flex-1 flex-col gap-3 overflow-y-auto p-4">
                  {activeThread?.messages.map((message) => {
                    const mine = message.from === "admin";
                    return (
                      <div
                        key={message._id}
                        className={`flex flex-col ${
                          mine ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-7 ${
                            mine
                              ? "rounded-ee-sm bg-primary text-primary-foreground"
                              : "rounded-es-sm bg-muted"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.text}
                          </p>
                        </div>
                        <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                          {mine ? "پشتیبانی" : message.username} ·{" "}
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={sendReply} className="flex items-center gap-2 border-t border-border/60 p-3">
                  <Input
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="پاسخ به کاربر..."
                    className="h-10 rounded-xl"
                    maxLength={1000}
                    disabled={busy}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="size-10 shrink-0 rounded-xl"
                    disabled={busy || !reply.trim()}
                  >
                    <Send className="size-4 -scale-x-100" />
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ───── دیالوگ افزودن/ویرایش ───── */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "ویرایش محصول" : "افزودن محصول جدید"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={submitProduct} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="p-title">عنوان محصول</Label>
                <Input
                  id="p-title"
                  name="title"
                  defaultValue={editing?.title}
                  placeholder="مثال: گوشی موبایل سامسونگ گلکسی A55"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-brand">برند</Label>
                <Input
                  id="p-brand"
                  name="brand"
                  defaultValue={editing?.brand}
                  placeholder="سامسونگ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-emoji">آیکون (ایموجی)</Label>
                <Input
                  id="p-emoji"
                  name="emoji"
                  defaultValue={editing?.emoji ?? "🛍️"}
                  maxLength={4}
                  placeholder="📱"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-category">دسته‌بندی</Label>
                <select
                  id="p-category"
                  name="category"
                  defaultValue={editing?.category ?? CATEGORIES[0].name}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.emoji} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-rating">امتیاز (۰ تا ۵)</Label>
                <Input
                  id="p-rating"
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  defaultValue={editing?.rating ?? 4.5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-price">قیمت (تومان)</Label>
                <Input
                  id="p-price"
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={editing?.price}
                  placeholder="1990000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-old-price">قیمت قبل (اختیاری)</Label>
                <Input
                  id="p-old-price"
                  name="oldPrice"
                  type="number"
                  min="0"
                  defaultValue={editing?.oldPrice}
                  placeholder="برای نمایش درصد تخفیف"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-stock">موجودی</Label>
                <Input
                  id="p-stock"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={editing?.stock ?? 10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-badge">برچسب (اختیاری)</Label>
                <Input
                  id="p-badge"
                  name="badge"
                  defaultValue={editing?.badge}
                  placeholder="پرفروش / جدید / تخفیف ویژه"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="p-description">توضیحات</Label>
                <Textarea
                  id="p-description"
                  name="description"
                  defaultValue={editing?.description}
                  placeholder="توضیح کوتاه درباره محصول..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
              >
                انصراف
              </Button>
              <Button type="submit" className="gap-2" disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {editing ? "ذخیره تغییرات" : "افزودن محصول"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ───── دیالوگ حذف ───── */}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف محصول؟</AlertDialogTitle>
            <AlertDialogDescription>
              «{deleting?.title}» برای همه کاربرها حذف می‌شود و از سبد خرید
              مشتری‌ها هم خارج خواهد شد. این عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              بله، حذف شود
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
