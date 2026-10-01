import { api } from "@/convex/_generated/api";
import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { friendlyError } from "@/lib/crypto";
import { useConvex } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  ShieldCheck,
  ShoppingCart,
  UserCheck,
  UserRound,
} from "lucide-react";
import { Suspense, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirect(returnTo: string | null, fallback: string) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

function Auth({ redirectAfterAuth = "/profile" }: AuthProps) {
  const { isAuthenticated, signIn, signUp, signOut, user } = useAuth();
  const convex = useConvex();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirect(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<"username" | "password">("username");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setStep("username");
    setPassword("");
    setConfirm("");
    setError(null);
  };

  /** مرحله ۱ ورود: پیدا کردن نام کاربری */
  const handleUsernameStep = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const clean = username.trim();
    if (clean.length < 3) {
      setError("نام کاربری باید حداقل ۳ حرف باشد.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const account = await convex.query(api.accounts.getSalt, {
        username: clean,
      });
      if (!account) throw new Error("چنین نام کاربری وجود ندارد.");
      setStep("password");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  /** مرحله ۲ ورود: رمز عبور دو بار (برای امنیت) */
  const handlePasswordStep = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (password.length < 4) {
      setError("رمز عبور باید حداقل ۴ کاراکتر باشد.");
      return;
    }
    if (password !== confirm) {
      setError("رمزهای وارد شده یکسان نیستند. دوباره وارد کنید.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(username.trim(), password);
      toast.success("خوش آمدی! وارد شدی ✌️");
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(friendlyError(err));
      setPassword("");
      setConfirm("");
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = username.trim();
    if (clean.length < 3) {
      setError("نام کاربری باید حداقل ۳ حرف باشد.");
      return;
    }
    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }
    if (password !== confirm) {
      setError("رمزهای وارد شده یکسان نیستند. دوباره وارد کنید.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signUp(clean, password);
      toast.success("حساب ساخته شد — خوش اومدی! 🎉");
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  // اگر کاربر از قبل وارد شده باشد، به جای فرم، پیام «وارد شده‌اید» نشان داده می‌شود
  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-[calc(100vh-11rem)] items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md rounded-3xl border-border/70 p-6 text-center shadow-xl">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
            ✅
          </div>
          <h1 className="text-xl font-black">شما وارد شده‌اید</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            حساب <b className="text-foreground">{user.username}</b> فعال است.
            برای ورود با یک حساب دیگر، اول خارج شوید.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Button
              className="h-11 w-full gap-2 rounded-xl"
              onClick={() => navigate(redirect)}
            >
              ادامه <ArrowLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full gap-2 rounded-xl"
              onClick={() => void signOut()}
            >
              <LogOut className="size-4" /> خروج از حساب
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-11rem)] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
        {/* فرم */}
        <Card className="mx-auto w-full max-w-md rounded-3xl border-border/70 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <img
                src={logo}
                alt="سوپر کالا"
                width={40}
                height={40}
                className="cursor-pointer"
                onClick={() => navigate("/")}
              />
            </div>
            <CardTitle className="text-2xl">
              {mode === "login" ? "ورود به حساب" : "ساخت حساب جدید"}
            </CardTitle>
            <CardDescription>
              بدون ایمیل — فقط نام کاربری و رمز عبور
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* سوییچ ورود / ثبت‌نام */}
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`rounded-full py-2 text-sm font-bold transition-colors ${
                  mode === "login"
                    ? "bg-card text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ورود
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`rounded-full py-2 text-sm font-bold transition-colors ${
                  mode === "register"
                    ? "bg-card text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ثبت‌نام
              </button>
            </div>

            {mode === "login" ? (
              step === "username" ? (
                <form onSubmit={handleUsernameStep} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">نام کاربری</Label>
                    <div className="relative">
                      <UserRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="مثال: علی یوسفی"
                        className="h-11 rounded-xl ps-9"
                        autoComplete="username"
                        disabled={busy}
                        autoFocus
                      />
                    </div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    اسمت اینجا نیست؟{" "}
                    <button
                      type="button"
                      className="font-bold text-primary hover:underline"
                      onClick={() => switchMode("register")}
                    >
                      ثبت‌نام کن
                    </button>
                  </p>
                  <Button
                    type="submit"
                    className="h-11 w-full gap-2 rounded-xl"
                    disabled={busy}
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArrowLeft className="size-4" />
                    )}
                    ادامه
                  </Button>
                </form>
              ) : (
                <form onSubmit={handlePasswordStep} className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2 font-bold text-emerald-800">
                      <UserCheck className="size-4 shrink-0 text-emerald-600" />
                      <span className="truncate">{username}</span>
                      <span className="shrink-0 text-xs font-medium text-emerald-600">
                        کاربر پیدا شد ✓
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-emerald-700 hover:text-emerald-900"
                      onClick={() => setStep("username")}
                    >
                      <Pencil className="size-3.5" /> تغییر
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">رمز عبور (مرحله ۱)</Label>
                    <PasswordInput
                      id="login-password"
                      value={password}
                      onChange={setPassword}
                      placeholder="رمز عبور"
                      autoComplete="current-password"
                      disabled={busy}
                      autoFocus
                      icon={Lock}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-confirm">
                      رمز عبور (مرحله ۲ — تکرار)
                    </Label>
                    <PasswordInput
                      id="login-confirm"
                      value={confirm}
                      onChange={setConfirm}
                      placeholder="دوباره همان رمز"
                      autoComplete="current-password"
                      disabled={busy}
                      icon={KeyRound}
                    />
                    <p className="text-xs text-muted-foreground">
                      🔒 برای امنیت بیشتر، رمز دو بار وارد می‌شود.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full gap-2 rounded-xl"
                    disabled={busy}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> در حال
                        ورود...
                      </>
                    ) : (
                      <>
                        ورود به حساب <ArrowLeft className="size-4" />
                      </>
                    )}
                  </Button>
                </form>
              )
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username">نام کاربری</Label>
                  <div className="relative">
                    <UserRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="یک نام کاربری انتخاب کنید"
                      className="h-11 rounded-xl ps-9"
                      autoComplete="username"
                      disabled={busy}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">رمز عبور (مرحله ۱)</Label>                    <PasswordInput
                      id="reg-password"
                      value={password}
                      onChange={setPassword}
                      placeholder="حداقل ۶ کاراکتر"
                      autoComplete="new-password"
                      disabled={busy}
                      icon={Lock}
                    />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">رمز عبور (مرحله ۲ — تکرار)</Label>                    <PasswordInput
                      id="reg-confirm"
                      value={confirm}
                      onChange={setConfirm}
                      placeholder="دوباره همان رمز"
                      autoComplete="new-password"
                      disabled={busy}
                      icon={KeyRound}
                    />
                  <p className="text-xs text-muted-foreground">
                    🔒 رمز را دو بار وارد کنید تا مطمئن شوید درست است.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full gap-2 rounded-xl"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> در حال ساخت
                      حساب...
                    </>
                  ) : (
                    <>
                      ساخت حساب <ArrowLeft className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {error && (
              <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-center text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <p className="mt-5 text-center text-xs text-muted-foreground">
              با ورود، قوانین سوپر کالا را می‌پذیرید.
            </p>
          </CardContent>
        </Card>

        {/* پنل تصویری */}
        <div className="relative hidden min-h-[500px] overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-emerald-600 to-teal-600 p-10 text-white lg:flex lg:flex-col lg:justify-center">
          <div className="absolute -start-16 -top-16 size-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -end-10 size-72 rounded-full bg-black/10" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
              <ShieldCheck className="size-3.5" /> امنیت دو مرحله‌ای رمز
            </span>
            <h2 className="mt-5 text-3xl font-black leading-10">
              به سوپر کالا خوش اومدی 👋
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/85">
              حساب بساز، سبد خریدت رو پر کن، سفارش بده و هر سوالی داشتی مستقیم
              با پشتیبانی چت کن.
            </p>

            <ul className="mt-7 space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/15">
                  <KeyRound className="size-4" />
                </span>
                رمز عبور دو بار وارد می‌شود؛ بدون هیچ ایمیلی
              </li>
              <li className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/15">
                  <ShoppingCart className="size-4" />
                </span>
                سبد خرید و سفارش‌هات همیشه در پروفایلت ذخیره می‌شه
              </li>
              <li className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/15">
                  <ArrowRight className="size-4" />
                </span>
                بعد از ورود، دقیقاً به همان صفحه‌ای که بودی برمی‌گردی
              </li>
            </ul>

            <div className="mt-8 flex gap-3 text-4xl">
              <span className="rounded-2xl bg-white/15 p-3 backdrop-blur">📱</span>
              <span className="rounded-2xl bg-white/15 p-3 backdrop-blur">💻</span>
              <span className="rounded-2xl bg-white/15 p-3 backdrop-blur">🎧</span>
              <span className="rounded-2xl bg-white/15 p-3 backdrop-blur">🏠</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** فیلد رمز عبور با دکمه نمایش/پنهان کردن رمز 👁 */
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  autoFocus,
  icon: Icon = Lock,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  icon?: typeof Lock;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Icon className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-xl ps-9 pe-10"
        autoComplete={autoComplete}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        title={visible ? "پنهان کردن رمز" : "نمایش رمز"}
        aria-label={visible ? "پنهان کردن رمز" : "نمایش رمز"}
        disabled={disabled}
        className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
