const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

function buildHeaders(user, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders
  };

  if (user) {
    headers["X-User-Id"] = user.userId;
    headers["X-User-Name"] = user.displayName;
    headers["X-User-Role"] = user.role;
  }

  return headers;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = payload?.message ?? `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function apiGet(path, user) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildHeaders(user)
  });
  return parseResponse(response);
}

export async function apiPost(path, body, user) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(user),
    body: JSON.stringify(body)
  });
  return parseResponse(response);
}

export { API_BASE_URL };
