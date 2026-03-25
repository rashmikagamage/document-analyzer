const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

type RequestOptions = RequestInit & {
  parseAs?: "json" | "text";
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { parseAs = "json", headers, body, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body,
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Request failed";

    try {
      const errorBody = await response.json();
      message = errorBody?.error?.message ?? message;
    } catch {
      // ignore non-JSON error bodies
    }

    throw new Error(message);
  }

  if (parseAs === "text") {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}