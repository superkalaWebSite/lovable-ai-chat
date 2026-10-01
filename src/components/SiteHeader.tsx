import { api } from "@/convex/_generated/api";
import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getSupportSeenAt, subscribeSupportSeen } from "@/lib/support-seen";
import { CATEGORIES } from "@/lib/shop";
import { useQuery } from "convex/react";
import { LifeBuoy, LogOut, Search, ShieldCheck, ShoppingCart, UserRound, X } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";

export function SiteHeader() {
  const { user, token, isAuthenticated, isAdmin, signOut } = useAuth();
  const cart = useQuery(api.cart.myCart, token ? { token } : "skip");
  const thread = useQuery(
    api.support.myThread,
    token && isAuthenticated ? { token } : "skip",
  );
  const inbox = useQuery(
    api.support.adminInbox,
    token && isAdmin ? { token } : "skip",
  );
  // تعداد گپ‌های کاربران که هنوز جواب داده نشده (نشان اعلان پنل مدیر)
  const waitingChats = useMemo(() => {
    if (!inbox) return 0;
    const last = new Map<string, (typeof inbox)[number]>();
    for (const message of inbox) {
      last.set(message.accountId as string, message);
    }
    return [...last.values()].filter((message) => message.from === "user")
      .length;
  }, [inbox]);
  const seenAt = useSyncExternalStore(
    subscribeSupportSeen,
    getSupportSeenAt,
    () => 0,
  );
  const unreadReplies = (thread ?? []).filter(
    (message) => message.from === "admin" && message.createdAt > seenAt,
  ).length;
  const cartCount = cart?.reduce((sum, item) => sum + item.qty, 0) ?? 0;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [term, setTerm] = useState("");
  const activeCat = searchParams.get("cat") ?? "";

  // دکمه ضربدر سبز «بیرون رفتن از صفحه» — در همه صفحه‌ها به جز صفحه اصلی
  const onHome = location.pathname === "/";
  const exitPage = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = term.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1.5 transition-colors ${
      isActive
        ? "bg-primary/10 font-bold text-primary"
        : "text-foreground/70 hover:bg-muted hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card">
      {/* نوار اطلاعات بالا */}
      <div className="bg-foreground text-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[11px] sm:text-xs">
          <span>🚚 ارسال رایگان برای خریدهای بالای ۵۰۰,۰۰۰ تومان</span>
          <span className="hidden sm:inline">
            پشتیبانی: ۰۲۱-۹۱۰۰۱۲۳۴ — شنبه تا چهارشنبه ۹ تا ۱۸
          </span>
        </div>
      </div>

      {/* ردیف اصلی */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        {!onHome && (
          <Button
            size="icon"
            onClick={exitPage}
            title="بازگشت به صفحه قبل"
            aria-label="بازگشت به صفحه قبل"
            className="size-9 shrink-0 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <X className="size-5" />
          </Button>
        )}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img src={logo} alt="لوگوی سوپر کالا" className="size-9 rounded-xl" />
          <span className="text-lg font-black tracking-tight sm:text-xl">
            سوپر <span className="text-primary">کالا</span>
          </span>
        </Link>

        <form
          onSubmit={submitSearch}
          className="relative mx-auto hidden w-full max-w-xl md:block"
        >
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="جستجو در سوپر کالا... مثلا «هندزفری بلوتوثی»"
            className="h-10 rounded-full bg-muted ps-9 pe-4"
          />
        </form>

        <div className="ms-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            title="جستجو"
            onClick={() => navigate("/shop")}
          >
            <Search className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            title={unreadReplies > 0 ? "پاسخ جدید پشتیبانی" : "پشتیبانی"}
            asChild
          >
            <Link to="/support">
              <LifeBuoy className="size-5" />
              {unreadReplies > 0 && (
                <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unreadReplies.toLocaleString("fa-IR")}
                </span>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            title="سبد خرید"
            asChild
          >
            <Link to="/cart">
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {cartCount.toLocaleString("fa-IR")}
                </span>
              )}
            </Link>
          </Button>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-full">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                    {user.username.slice(0, 1)}
                  </span>
                  <span className="hidden max-w-28 truncate sm:inline">
                    {user.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-bold">{user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin ? "مدیر سایت" : "کاربر سوپر کالا"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <UserRound className="me-2 size-4" /> پروفایل من
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/cart")}>
                  <ShoppingCart className="me-2 size-4" /> سبد خرید
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/support")}>
                  <LifeBuoy className="me-2 size-4" /> پشتیبانی
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/admin")}>
                      <ShieldCheck className="me-2 size-4" /> پنل کنترل سایت
                      {waitingChats > 0 && (
                        <span className="ms-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
                          {waitingChats.toLocaleString("fa-IR")}
                        </span>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => {
                    void signOut().then(() => navigate("/"));
                  }}
                >
                  <LogOut className="me-2 size-4" /> خروج از حساب
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="rounded-full gap-2">
              <Link to="/auth">
                <UserRound className="size-4" />
                ثبت‌نام
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ردیف دسته‌بندی */}
      <nav className="hidden border-t border-border/60 bg-muted/40 lg:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center gap-1 px-4 text-sm">
          <Link
            to="/shop"
            className={`rounded-full px-3 py-1.5 transition-colors ${
              location.pathname === "/shop" && !activeCat
                ? "bg-primary/10 font-bold text-primary"
                : "text-foreground/70 hover:bg-muted hover:text-foreground"
            }`}
          >
            همه محصولات
          </Link>
          {CATEGORIES.slice(0, 6).map((category) => (
            <Link
              key={category.name}
              to={`/shop?cat=${encodeURIComponent(category.name)}`}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                location.pathname === "/shop" && activeCat === category.name
                  ? "bg-primary/10 font-bold text-primary"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              {category.emoji} {category.name}
            </Link>
          ))}
          <NavLink to="/support" className={navClass}>
            پشتیبانی
          </NavLink>
          {isAdmin && (
            <Link
              to="/admin"
              className="ms-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-primary transition-colors hover:bg-muted"
            >
              <ShieldCheck className="size-4" /> پنل کنترل سایت
              {waitingChats > 0 && (
                <span
                  title={`${waitingChats.toLocaleString("fa-IR")} گپ بی‌جواب`}
                  className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground"
                >
                  {waitingChats.toLocaleString("fa-IR")}
                </span>
              )}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
