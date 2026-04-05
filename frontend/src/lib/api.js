const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

const defaultHeaders = {
  "Content-Type": "application/json",
  "X-User-Id": "admin-1",
  "X-User-Name": "Admin Demo",
  "X-User-Role": "ADMIN"
};

export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: defaultHeaders
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export { API_BASE_URL };
