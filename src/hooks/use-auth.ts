import { api } from "@/convex/_generated/api";
import { friendlyError, randomSalt, sha256Hex } from "@/lib/crypto";
import { getToken, setToken, subscribeSession } from "@/lib/session";
import { useConvex, useMutation, useQuery } from "convex/react";
import { useCallback, useSyncExternalStore } from "react";

/**
 * ورود/ثبت‌نام بدون ایمیل — فقط نام کاربری و رمز عبور.
 * رمز دو بار در فرم وارد می‌شود و به صورت هش (SHA-256 + salt) ارسال می‌گردد.
 */
export function useAuth() {
  const token = useSyncExternalStore(
    subscribeSession,
    getToken,
    () => "" as string,
  );
  const user = useQuery(api.accounts.getCurrentUser, token ? { token } : "skip");
  const convex = useConvex();
  const registerMutation = useMutation(api.accounts.register);
  const loginMutation = useMutation(api.accounts.login);
  const logoutMutation = useMutation(api.accounts.logout);

  const isLoading = token !== "" && user === undefined;

  const signUp = useCallback(
    async (username: string, password: string) => {
      const clean = username.trim();
      if (clean.length < 3) throw new Error("نام کاربری باید حداقل ۳ حرف باشد.");
      const salt = randomSalt();
      const passwordHash = await sha256Hex(`${salt}:${password}`);
      try {
        const { token: newToken } = await registerMutation({
          username: clean,
          salt,
          passwordHash,
        });
        setToken(newToken);
      } catch (error) {
        throw new Error(friendlyError(error));
      }
    },
    [registerMutation],
  );

  const signIn = useCallback(
    async (username: string, password: string) => {
      let salt: string;
      try {
        const account = await convex.query(api.accounts.getSalt, {
          username,
        });
        if (!account) throw new Error("چنین نام کاربری وجود ندارد.");
        salt = account.salt;
      } catch (error) {
        throw new Error(friendlyError(error));
      }
      const passwordHash = await sha256Hex(`${salt}:${password}`);
      try {
        const { token: newToken } = await loginMutation({
          username,
          passwordHash,
        });
        setToken(newToken);
      } catch (error) {
        throw new Error(friendlyError(error));
      }
    },
    [convex, loginMutation],
  );

  const signOut = useCallback(async () => {
    const current = getToken();
    setToken("");
    if (current) {
      try {
        await logoutMutation({ token: current });
      } catch (error) {
        console.warn("signOut:", error);
      }
    }
  }, [logoutMutation]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    signUp,
    signIn,
    signOut,
  };
}
