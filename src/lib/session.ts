const KEY = "supercala_session";

let token: string =
  typeof window !== "undefined" ? (localStorage.getItem(KEY) ?? "") : "";

const listeners = new Set<() => void>();

export function getToken(): string {
  return token;
}

export function setToken(next: string) {
  token = next;
  if (typeof window === "undefined") return;
  if (next) localStorage.setItem(KEY, next);
  else localStorage.removeItem(KEY);
  listeners.forEach((listener) => listener());
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
