import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(rootDir, "data");
const dbPath = join(dataDir, "adech.sqlite");
const superiorPath = join(
  rootDir,
  "node_modules",
  "@adech",
  "themes",
  "dist",
  "superior",
  "superior.json"
);

const BRANCH_META = {
  superior: {
    title: "Superior",
    slug: "superior",
    description:
      "The first Adech branch: a portable color system made from calm blue, green, violet, warm, and neutral palettes.",
  },
};

const SUBBRANCH_META = {
  boulevard:
    "The city, distance, and the quiet loneliness that can exist even in a crowded world.",
  venomous:
    "The nature, ancient presence, and the magical force of everything we cannot fully explain.",
  swamp:
    "The calm, breathing space, and the quiet strength of staying with yourself.",
  sunny:
    "The warmth, unexpected emotion, and that quiet energy that arrives without explanation.",
  void:
    "The indifference, emptiness, and the quiet acceptance of what cannot be changed.",
};

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON");

function run(sql, params = {}) {
  return Array.isArray(params)
    ? db.prepare(sql).run(...params)
    : db.prepare(sql).run(params);
}

function get(sql, params = {}) {
  return Array.isArray(params)
    ? db.prepare(sql).get(...params)
    : db.prepare(sql).get(params);
}

function all(sql, params = {}) {
  return Array.isArray(params)
    ? db.prepare(sql).all(...params)
    : db.prepare(sql).all(params);
}

function now() {
  return new Date().toISOString();
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    );

    CREATE TABLE IF NOT EXISTS subbranches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS color_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subbranch_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      hex TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (subbranch_id) REFERENCES subbranches(id) ON DELETE CASCADE
    );
  `);

  seedSuperiorBranch();
}

function seedSuperiorBranch() {
  const existing = get("SELECT id FROM branches WHERE slug = ?", ["superior"]);
  if (existing || !existsSync(superiorPath)) return;

  const theme = JSON.parse(readFileSync(superiorPath, "utf8"));
  const meta = BRANCH_META.superior;
  const timestamp = now();

  run(
    `INSERT INTO branches (title, slug, description, status, created_at, updated_at, published_at)
     VALUES (?, ?, ?, 'published', ?, ?, ?)`,
    [meta.title, meta.slug, meta.description, timestamp, timestamp, timestamp]
  );

  const branchId = db.prepare("SELECT last_insert_rowid() AS id").get().id;

  Object.entries(theme.subbranches || {}).forEach(([name, scale], index) => {
    run(
      `INSERT INTO subbranches (branch_id, name, description, position)
       VALUES (?, ?, ?, ?)`,
      [branchId, name, SUBBRANCH_META[name] || "", index]
    );

    const subbranchId = db.prepare("SELECT last_insert_rowid() AS id").get().id;

    Object.entries(scale).forEach(([step, hex], tokenIndex) => {
      run(
        `INSERT INTO color_tokens (subbranch_id, name, hex, position)
         VALUES (?, ?, ?, ?)`,
        [subbranchId, `adech-${name}-${step}`, hex, tokenIndex]
      );
    });
  });
}

function hydrateBranch(row) {
  if (!row) return null;

  const subbranches = all(
    "SELECT * FROM subbranches WHERE branch_id = ? ORDER BY position ASC, id ASC",
    [row.id]
  ).map((subbranch) => ({
    id: subbranch.id,
    name: subbranch.name,
    description: subbranch.description,
    tokens: all(
      "SELECT * FROM color_tokens WHERE subbranch_id = ? ORDER BY position ASC, id ASC",
      [subbranch.id]
    ).map((token) => ({
      id: token.id,
      name: token.name,
      hex: token.hex,
    })),
  }));

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    subbranches,
  };
}

export function listBranches({ publicOnly = false } = {}) {
  const rows = all(
    `SELECT * FROM branches ${publicOnly ? "WHERE status = 'published'" : ""}
     ORDER BY COALESCE(published_at, updated_at) DESC, id DESC`
  );

  return rows.map(hydrateBranch);
}

export function getBranchBySlug(slug, { publicOnly = false } = {}) {
  const row = get(
    `SELECT * FROM branches WHERE slug = ? ${publicOnly ? "AND status = 'published'" : ""}`,
    [slug]
  );

  return hydrateBranch(row);
}

export function saveBranch(input) {
  const timestamp = now();
  const slug = slugify(input.slug || input.title);
  const status = input.status === "published" ? "published" : "draft";

  if (!slug) {
    const error = new Error("Branch slug is required.");
    error.statusCode = 400;
    throw error;
  }

  const duplicate = get(
    "SELECT id FROM branches WHERE slug = ? AND id != ?",
    [slug, input.id || 0]
  );

  if (duplicate) {
    const error = new Error("A branch with this slug already exists.");
    error.statusCode = 409;
    throw error;
  }

  const publishedAt =
    status === "published" ? input.publishedAt || timestamp : null;

  let branchId = input.id;

  db.exec("BEGIN");
  try {
    if (branchId) {
      run(
        `UPDATE branches
         SET title = ?, slug = ?, description = ?, status = ?, updated_at = ?, published_at = ?
         WHERE id = ?`,
        [
          input.title,
          slug,
          input.description || "",
          status,
          timestamp,
          publishedAt,
          branchId,
        ]
      );
      run("DELETE FROM subbranches WHERE branch_id = ?", [branchId]);
    } else {
      run(
        `INSERT INTO branches (title, slug, description, status, created_at, updated_at, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          input.title,
          slug,
          input.description || "",
          status,
          timestamp,
          timestamp,
          publishedAt,
        ]
      );
      branchId = db.prepare("SELECT last_insert_rowid() AS id").get().id;
    }

    (input.subbranches || []).forEach((subbranch, position) => {
      run(
        `INSERT INTO subbranches (branch_id, name, description, position)
         VALUES (?, ?, ?, ?)`,
        [branchId, subbranch.name, subbranch.description || "", position]
      );

      const subbranchId = db.prepare("SELECT last_insert_rowid() AS id").get()
        .id;

      (subbranch.tokens || []).forEach((token, tokenPosition) => {
        run(
          `INSERT INTO color_tokens (subbranch_id, name, hex, position)
           VALUES (?, ?, ?, ?)`,
          [subbranchId, token.name, token.hex, tokenPosition]
        );
      });
    });

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  const row = get("SELECT * FROM branches WHERE id = ?", [branchId]);
  return hydrateBranch(row);
}

export function deleteBranch(id) {
  return run("DELETE FROM branches WHERE id = ?", [id]).changes;
}
