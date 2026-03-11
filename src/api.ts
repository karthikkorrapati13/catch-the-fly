export const API = "https://catch-the-fly.onrender.com";

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API}${endpoint}`, options);

  const text = await res.text();

  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  } catch {
    throw new Error("Server error or invalid response");
  }
}
