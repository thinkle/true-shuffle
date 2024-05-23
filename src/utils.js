import { getAuthToken } from "./authStore";

export async function fetchWithAuth(url, options = {}) {
  const token = await getAuthToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  return await fetch(url, { ...options, headers });
}

export function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
