import { createServer } from "node:http";
import {
  deleteBranch,
  getBranchBySlug,
  initDatabase,
  listBranches,
  saveBranch,
} from "./database.js";

const PORT = Number(process.env.ADECH_API_PORT || 3001);
const ADMIN_TOKEN = process.env.ADECH_ADMIN_TOKEN || "adech-local-admin";
const ADMIN_USERNAME = process.env.ADECH_ADMIN_USERNAME || "adechlien";

initDatabase();

function send(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function requireAdmin(req) {
  return req.headers["x-admin-token"] === ADMIN_TOKEN;
}

function validateBranch(payload) {
  if (!payload.title?.trim()) return "Branch title is required.";
  if (!Array.isArray(payload.subbranches)) return "Subbranches must be a list.";

  for (const subbranch of payload.subbranches) {
    if (!subbranch.name?.trim()) return "Every subbranch needs a name.";
    if (!Array.isArray(subbranch.tokens)) return "Tokens must be a list.";

    for (const token of subbranch.tokens) {
      if (!token.name?.trim()) return "Every token needs a name.";
      if (!/^#[0-9a-fA-F]{6}$/.test(token.hex || "")) {
        return "Every token needs a valid HEX color.";
      }
    }
  }

  return null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }

  try {
    if (req.method === "GET" && path === "/health") {
      send(res, 200, { status: "ok", service: "adech-api" });
      return;
    }

    if (req.method === "POST" && path === "/api/auth/login") {
      const body = await readJson(req);
      if (body.token !== ADMIN_TOKEN || body.username !== ADMIN_USERNAME) {
        send(res, 401, { message: "Usuario o contraseña incorrectos." });
        return;
      }

      send(res, 200, { token: ADMIN_TOKEN });
      return;
    }

    if (req.method === "GET" && path === "/api/branches") {
      send(res, 200, { branches: listBranches({ publicOnly: true }) });
      return;
    }

    if (req.method === "GET" && path.startsWith("/api/branches/")) {
      const slug = decodeURIComponent(path.replace("/api/branches/", ""));
      const branch = getBranchBySlug(slug, { publicOnly: true });

      if (!branch) {
        send(res, 404, { message: "Branch not found." });
        return;
      }

      send(res, 200, { branch });
      return;
    }

    if (path.startsWith("/api/admin") && !requireAdmin(req)) {
      send(res, 401, { message: "Admin token is required." });
      return;
    }

    if (req.method === "GET" && path === "/api/admin/branches") {
      send(res, 200, { branches: listBranches() });
      return;
    }

    if (req.method === "POST" && path === "/api/admin/branches") {
      const body = await readJson(req);
      const error = validateBranch(body);

      if (error) {
        send(res, 400, { message: error });
        return;
      }

      send(res, 201, { branch: saveBranch(body) });
      return;
    }

    if (req.method === "PUT" && path.startsWith("/api/admin/branches/")) {
      const id = Number(path.replace("/api/admin/branches/", ""));
      const body = await readJson(req);
      const error = validateBranch(body);

      if (!Number.isFinite(id)) {
        send(res, 400, { message: "Invalid branch id." });
        return;
      }

      if (error) {
        send(res, 400, { message: error });
        return;
      }

      send(res, 200, { branch: saveBranch({ ...body, id }) });
      return;
    }

    if (req.method === "DELETE" && path.startsWith("/api/admin/branches/")) {
      const id = Number(path.replace("/api/admin/branches/", ""));
      const changes = deleteBranch(id);
      send(res, changes ? 200 : 404, {
        message: changes ? "Branch deleted." : "Branch not found.",
      });
      return;
    }

    send(res, 404, { message: "Not found." });
  } catch (error) {
    send(res, error.statusCode || 500, {
      message: error.message || "Unexpected server error.",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Adech API running at http://localhost:${PORT}`);
});
