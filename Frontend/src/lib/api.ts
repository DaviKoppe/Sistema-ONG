export async function apiJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(path, {
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

