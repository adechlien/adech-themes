import { useEffect, useMemo, useState } from "react";
import {
  IconDeviceFloppy,
  IconLogout,
  IconMoonFilled,
  IconPlus,
  IconSunHighFilled,
  IconTrash,
} from "@tabler/icons-react";
import {
  clearAdminToken,
  deleteAdminBranch,
  fetchAdminBranches,
  getStoredAdminToken,
  loginAdmin,
  saveAdminBranch,
} from "../lib/api";

let clientId = 0;

function nextClientId() {
  clientId += 1;
  return `client-${clientId}`;
}

const emptyBranch = {
  title: "",
  slug: "",
  description: "",
  status: "draft",
  subbranches: [
    {
      _key: nextClientId(),
      name: "palette",
      description: "",
      tokens: [],
    },
  ],
};

function cloneBranch(branch) {
  return JSON.parse(JSON.stringify(branch));
}

function withClientKeys(branch) {
  return {
    ...cloneBranch(branch),
    subbranches: (branch.subbranches || []).map((subbranch) => ({
      ...subbranch,
      _key: subbranch._key || `subbranch-${subbranch.id || nextClientId()}`,
      tokens: (subbranch.tokens || []).map((token) => ({
        ...token,
        _key: token._key || `token-${token.id || nextClientId()}`,
      })),
    })),
  };
}

function cleanBranch(branch) {
  return {
    ...branch,
    subbranches: branch.subbranches.map((subbranch) => {
      const nextSubbranch = { ...subbranch };
      delete nextSubbranch._key;
      nextSubbranch.tokens = subbranch.tokens.map((token) => {
        const nextToken = { ...token };
        delete nextToken._key;
        return nextToken;
      });
      return nextSubbranch;
    }),
  };
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function useAdechTheme() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem("adech-theme");
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("adech-theme", theme);
  }, [theme]);

  return [theme, setTheme];
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-(--adech-title)">
      {label}
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-lg border border-(--adech-border) bg-(--adech-surface-muted)",
        "px-3 py-2 text-sm font-normal text-(--adech-fg) outline-none transition",
        "placeholder:text-(--adech-muted) focus:border-(--adech-nav-bg-active)",
        props.className || "",
      ].join(" ")}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-24 w-full rounded-lg border border-(--adech-border) bg-(--adech-surface-muted)",
        "px-3 py-2 text-sm font-normal leading-relaxed text-(--adech-fg) outline-none transition",
        "placeholder:text-(--adech-muted) focus:border-(--adech-nav-bg-active)",
        props.className || "",
      ].join(" ")}
    />
  );
}

function IconButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-(--adech-border)",
        "bg-(--adech-surface-muted) text-(--adech-title) transition hover:bg-(--adech-surface-strong)",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function AdminBranches() {
  const [theme, setTheme] = useAdechTheme();
  const [token, setToken] = useState(() => getStoredAdminToken());
  const [tokenDraft, setTokenDraft] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(() => withClientKeys(emptyBranch));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === selectedId),
    [branches, selectedId]
  );

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    fetchAdminBranches(token)
      .then((data) => {
        setBranches(data.branches);
        if (data.branches[0]) {
          setSelectedId(data.branches[0].id);
          setDraft(withClientKeys(data.branches[0]));
        }
      })
      .catch((error) => {
        setMessage(error.message);
        clearAdminToken();
        setToken("");
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!selectedBranch) return;
    setDraft(withClientKeys(selectedBranch));
  }, [selectedBranch]);

  const updateDraft = (patch) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const updateSubbranch = (index, patch) => {
    setDraft((current) => ({
      ...current,
      subbranches: current.subbranches.map((subbranch, subIndex) =>
        subIndex === index ? { ...subbranch, ...patch } : subbranch
      ),
    }));
  };

  const updateToken = (subIndex, tokenIndex, patch) => {
    setDraft((current) => ({
      ...current,
      subbranches: current.subbranches.map((subbranch, index) => {
        if (index !== subIndex) return subbranch;

        return {
          ...subbranch,
          tokens: subbranch.tokens.map((item, itemIndex) =>
            itemIndex === tokenIndex ? { ...item, ...patch } : item
          ),
        };
      }),
    }));
  };

  const addToken = (subIndex) => {
    setDraft((current) => ({
      ...current,
      subbranches: current.subbranches.map((subbranch, index) => {
        if (index !== subIndex) return subbranch;

        const tokenNumber = subbranch.tokens.length + 1;
        return {
          ...subbranch,
          tokens: [
            ...subbranch.tokens,
            {
              _key: nextClientId(),
              name: `adech-${subbranch.name || "palette"}-${tokenNumber}`,
              hex: "#FFFFFF",
            },
          ],
        };
      }),
    }));
  };

  const removeToken = (subIndex, tokenIndex) => {
    setDraft((current) => ({
      ...current,
      subbranches: current.subbranches.map((subbranch, index) =>
        index === subIndex
          ? {
              ...subbranch,
              tokens: subbranch.tokens.filter((_, itemIndex) => itemIndex !== tokenIndex),
            }
          : subbranch
      ),
    }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const nextToken = await loginAdmin(tokenDraft);
      setToken(nextToken);
      setTokenDraft("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const onSave = async () => {
    setMessage("");
    setLoading(true);

    try {
      const data = await saveAdminBranch(cleanBranch(draft), token);
      const nextBranches = await fetchAdminBranches(token);
      setBranches(nextBranches.branches);
      setSelectedId(data.branch.id);
      setMessage("Branch saved.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!draft.id) return;

    setMessage("");
    setLoading(true);

    try {
      await deleteAdminBranch(draft.id, token);
      const data = await fetchAdminBranches(token);
      setBranches(data.branches);
      setSelectedId(data.branches[0]?.id || null);
      setDraft(data.branches[0] ? withClientKeys(data.branches[0]) : withClientKeys(emptyBranch));
      setMessage("Branch deleted.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const themeToggle = (
    <IconButton
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      aria-label={`Activate ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Activate ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <IconMoonFilled size={20} /> : <IconSunHighFilled size={20} />}
    </IconButton>
  );

  if (!token) {
    return (
      <main className="min-h-screen bg-(--adech-bg) px-6 text-(--adech-fg)">
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center">
          <div className="mb-4 flex justify-end">{themeToggle}</div>
          <form
            onSubmit={onLogin}
            className="rounded-lg bg-(--adech-surface) p-6 ring-1 ring-(--adech-border)"
          >
            <h1 className="font-bebas text-5xl text-(--adech-title)">Adechen</h1>
            <p className="mt-2 text-sm leading-relaxed text-(--adech-paragraph)">
              Admin access for creating and publishing Adech branches.
            </p>

            <div className="mt-6">
              <Field label="Admin token">
                <TextInput
                  type="password"
                  value={tokenDraft}
                  onChange={(event) => setTokenDraft(event.target.value)}
                  placeholder="ADECH_ADMIN_TOKEN"
                />
              </Field>
            </div>

            {message && <p className="mt-4 text-sm text-(--adech-muted)">{message}</p>}

            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-(--adech-hero-bg-button) px-4 py-2 text-sm font-semibold text-(--adech-hero-fg-button)"
            >
              Enter admin
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-(--adech-bg) px-6 py-8 text-(--adech-fg)">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-bebas text-5xl text-(--adech-title)">Adechen</h1>
              <p className="text-sm text-(--adech-paragraph)">Branch manager</p>
            </div>
            {themeToggle}
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setDraft(withClientKeys(emptyBranch));
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--adech-hero-bg-button) px-4 py-2 text-sm font-semibold text-(--adech-hero-fg-button)"
          >
            <IconPlus size={18} />
            New branch
          </button>

          <div className="flex flex-col gap-2">
            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => setSelectedId(branch.id)}
                className={[
                  "rounded-lg border px-3 py-2 text-left text-sm transition",
                  selectedId === branch.id
                    ? "border-(--adech-nav-bg-active) bg-(--adech-surface-strong)"
                    : "border-(--adech-border) bg-(--adech-surface)",
                ].join(" ")}
              >
                <span className="block font-semibold text-(--adech-title)">
                  {branch.title}
                </span>
                <span className="text-xs text-(--adech-muted)">
                  {branch.status}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              clearAdminToken();
              setToken("");
            }}
            className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-(--adech-muted)"
          >
            <IconLogout size={18} />
            Sign out
          </button>
        </aside>

        <section className="rounded-lg bg-(--adech-surface) p-6 ring-1 ring-(--adech-border)">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-(--adech-title)">
                {draft.id ? "Edit branch" : "Create branch"}
              </h2>
              <p className="text-sm text-(--adech-paragraph)">
                Published branches appear on the public Branches page.
              </p>
            </div>

            <div className="flex gap-2">
              {draft.id && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center gap-2 rounded-lg border border-(--adech-border) px-4 py-2 text-sm font-semibold text-(--adech-title)"
                >
                  <IconTrash size={18} />
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onSave}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-(--adech-hero-bg-button) px-4 py-2 text-sm font-semibold text-(--adech-hero-fg-button) disabled:opacity-60"
              >
                <IconDeviceFloppy size={18} />
                Save
              </button>
            </div>
          </div>

          {message && <p className="mt-4 text-sm text-(--adech-muted)">{message}</p>}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <TextInput
                value={draft.title}
                onChange={(event) =>
                  updateDraft({
                    title: event.target.value,
                    slug: draft.slug || slugify(event.target.value),
                  })
                }
              />
            </Field>

            <Field label="Slug">
              <TextInput
                value={draft.slug}
                onChange={(event) => updateDraft({ slug: slugify(event.target.value) })}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Description">
              <TextArea
                value={draft.description}
                onChange={(event) => updateDraft({ description: event.target.value })}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Status">
              <select
                value={draft.status}
                onChange={(event) => updateDraft({ status: event.target.value })}
                className="w-full rounded-lg border border-(--adech-border) bg-(--adech-surface-muted) px-3 py-2 text-sm text-(--adech-fg) outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            {draft.subbranches.map((subbranch, subIndex) => (
              <div
                key={subbranch._key}
                className="rounded-lg border border-(--adech-border) bg-(--adech-surface-muted) p-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Subbranch">
                    <TextInput
                      value={subbranch.name}
                      onChange={(event) =>
                        updateSubbranch(subIndex, { name: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Description">
                    <TextInput
                      value={subbranch.description}
                      onChange={(event) =>
                        updateSubbranch(subIndex, {
                          description: event.target.value,
                        })
                      }
                    />
                  </Field>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {subbranch.tokens.map((tokenItem, tokenIndex) => (
                    <div
                      key={tokenItem._key}
                      className="grid gap-3 md:grid-cols-[1fr_140px_44px_44px]"
                    >
                      <TextInput
                        value={tokenItem.name}
                        onChange={(event) =>
                          updateToken(subIndex, tokenIndex, {
                            name: event.target.value,
                          })
                        }
                        placeholder="adech-palette-1"
                      />
                      <TextInput
                        value={tokenItem.hex}
                        onChange={(event) =>
                          updateToken(subIndex, tokenIndex, {
                            hex: event.target.value,
                          })
                        }
                        placeholder="#FFFFFF"
                      />
                      <span
                        className="h-10 rounded-lg border border-(--adech-border)"
                        style={{ backgroundColor: tokenItem.hex }}
                      />
                      <IconButton
                        type="button"
                        onClick={() => removeToken(subIndex, tokenIndex)}
                        aria-label="Delete color token"
                        title="Delete color token"
                      >
                        <IconTrash size={18} />
                      </IconButton>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addToken(subIndex)}
                    className="inline-flex items-center gap-2 rounded-lg border border-(--adech-border) px-3 py-2 text-sm font-semibold text-(--adech-title)"
                  >
                    <IconPlus size={18} />
                    Create Color Token
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        subbranches: current.subbranches.filter(
                          (_, index) => index !== subIndex
                        ),
                      }))
                    }
                    className="rounded-lg border border-(--adech-border) px-3 py-2 text-sm font-semibold text-(--adech-title)"
                  >
                    Remove subbranch
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              updateDraft({
                subbranches: [
                  ...draft.subbranches,
                  { _key: nextClientId(), name: "palette", description: "", tokens: [] },
                ],
              })
            }
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-(--adech-border) px-4 py-2 text-sm font-semibold text-(--adech-title)"
          >
            <IconPlus size={18} />
            Add subbranch
          </button>
        </section>
      </div>
    </main>
  );
}
