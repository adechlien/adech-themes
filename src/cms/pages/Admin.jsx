import { useEffect, useMemo, useState } from "react";
import {
  IconLogout,
  IconPalette,
  IconMoonFilled,
  IconSunHighFilled,
  IconTypography,
  IconComponents,
  IconIcons,
  IconTools,
} from "@tabler/icons-react";
import {
  clearAdminToken,
  deleteAdminBranch,
  fetchAdminBranches,
  getStoredAdminToken,
  loginAdmin,
  saveAdminBranch,
} from "../../lib/api";
import { IconButton } from "../components/Fields";
import CmsShell from "../components/CmsShell";
import CmsAccessCard from "../components/CmsAccessCard";
import BranchEditor from "../modules/themes/BranchEditor";
import BranchLibrary from "../modules/themes/BranchLibrary";

const sections = [
  { id: "themes", label: "Themes", icon: IconPalette },
  { id: "tools", label: "Tools", icon: IconTools, disabled: true },
  { id: "typography", label: "Typography", icon: IconTypography, disabled: true },
  { id: "components", label: "Components", icon: IconComponents, disabled: true },
  { id: "icons", label: "Icons", icon: IconIcons, disabled: true },
];

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

export default function Admin() {
  useEffect(() => {
    document.title = "Adechen — Admin";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);
  const [theme, setTheme] = useAdechTheme();
  const [token, setToken] = useState(() => getStoredAdminToken());
  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);
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
    setLoading(true);

    try {
      const nextToken = await loginAdmin(tokenDraft, username);
      setToken(nextToken);
      setTokenDraft("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
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

  const access = <CmsAccessCard>
    <form onSubmit={onLogin} className="flex flex-1 flex-col gap-3.5">
      <label className="relative block pt-2"><span className="absolute top-0 left-[22px] bg-adech-swamp-3 px-[5px] text-sm">Usuario</span><input className="h-9 w-full rounded-lg border border-adech-boulevard-1 bg-transparent px-3 py-1.5 outline-none focus:outline-2 focus:outline-offset-2 focus:outline-adech-boulevard-4" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label>
      <label className="relative block pt-2"><span className="absolute top-0 left-[22px] bg-adech-swamp-3 px-[5px] text-sm">Contraseña</span><input className="h-9 w-full rounded-lg border border-adech-boulevard-1 bg-transparent px-3 py-1.5 outline-none focus:outline-2 focus:outline-offset-2 focus:outline-adech-boulevard-4" type="password" value={tokenDraft} onChange={(event) => setTokenDraft(event.target.value)} autoComplete="current-password" required /></label>
      {message && <p role="status" className="text-xs">{message}</p>}
      <button type="submit" disabled={loading} className="mt-auto h-10 shrink-0 rounded-lg bg-adech-boulevard-1 text-sm text-adech-swamp-3 disabled:opacity-60">{loading ? "Ingresando…" : "Ingresar"}</button>
    </form>
  </CmsAccessCard>;

  return (
    <CmsShell name="Adechen" authenticated={Boolean(token)} access={access} sections={sections} activeSection="themes" onSectionChange={() => setEditing(false)} controls={themeToggle} footer={
      <button type="button" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={() => { clearAdminToken(); setToken(""); setMessage(""); setEditing(false); }}><IconLogout size={20} /></button>
    }>
      {editing ? <>
        <button type="button" className="mb-6 text-sm text-(--adech-title) hover:underline" onClick={() => setEditing(false)}>← Themes</button>
        <BranchEditor {...{ draft, updateDraft, onSave, onDelete, loading, message, updateSubbranch, updateToken, addToken, removeToken, setDraft, nextClientId, slugify }} />
      </> : <BranchLibrary branches={branches} loading={loading} message={message} onSelect={(id) => { setSelectedId(id); setEditing(true); setMessage(""); }} onCreate={() => { setSelectedId(null); setDraft(withClientKeys(emptyBranch)); setEditing(true); setMessage(""); }} />}
    </CmsShell>
  );
}
