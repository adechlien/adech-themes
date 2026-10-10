const ADMIN_TOKEN_KEY = "adech-admin-token";

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { "X-Admin-Token": options.token } : {}),
      ...(options.headers || {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function getStoredAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function storeAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function loginAdmin(token) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: { token },
  });

  storeAdminToken(data.token);
  return data.token;
}

export async function fetchPublishedBranches() {
  return request("/api/branches");
}

export async function fetchAdminBranches(token) {
  return request("/api/admin/branches", { token });
}

export async function saveAdminBranch(branch, token) {
  const path = branch.id
    ? `/api/admin/branches/${branch.id}`
    : "/api/admin/branches";

  return request(path, {
    method: branch.id ? "PUT" : "POST",
    token,
    body: branch,
  });
}

export async function deleteAdminBranch(id, token) {
  return request(`/api/admin/branches/${id}`, {
    method: "DELETE",
    token,
  });
}
