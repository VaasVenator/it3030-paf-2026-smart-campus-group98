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
  if (response.status === 204) {
    return null;
  }

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

export async function apiGet(path, user, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildHeaders(user, options.headers),
    credentials: options.credentials
  });
  return parseResponse(response);
}

export async function apiPost(path, body, user, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(user, options.headers),
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: options.credentials
  });
  return parseResponse(response);
}

export async function apiPut(path, body, user, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: buildHeaders(user, options.headers),
    body: JSON.stringify(body),
    credentials: options.credentials
  });
  return parseResponse(response);
}

export async function apiDelete(path, user, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: buildHeaders(user, options.headers),
    credentials: options.credentials
  });
  return parseResponse(response);
}

export { API_BASE_URL };
