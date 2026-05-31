const BASE_URL = import.meta.env.VITE_API_URL ?? "https://sistema-ong-backend.onrender.com";

export async function apiJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      typeof (data as any)?.error === "string"
        ? (data as any).error
        : `Erro HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}

// cache bust
