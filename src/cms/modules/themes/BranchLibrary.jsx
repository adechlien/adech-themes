import { useState } from "react";
import { IconPalette, IconPlus, IconSearch } from "@tabler/icons-react";

export default function BranchLibrary({ branches, loading, message, onSelect, onCreate }) {
  const [status, setStatus] = useState("published");
  const [search, setSearch] = useState("");
  const visible = branches.filter((branch) => branch.status === status && `${branch.title} ${branch.slug}`.toLowerCase().includes(search.toLowerCase()));
  return <section>
    <header className="flex flex-wrap items-center justify-between gap-6">
      <h1 className="text-4xl font-bold text-(--adech-title)">Themes</h1>
      <button type="button" onClick={onCreate} className="inline-flex items-center gap-2 rounded-lg bg-(--adech-hero-bg-button) px-5 py-3 text-sm font-bold text-(--adech-hero-fg-button)"><IconPlus size={20} />Nueva Branch</button>
    </header>
    <p className="mt-6 inline-flex items-center gap-2 rounded-lg border border-(--adech-border) px-3 py-2 text-sm"><IconPalette size={18} />Branches</p>
    <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
      <div className="inline-flex gap-1 rounded-lg bg-(--adech-surface-muted) p-1" aria-label="Estado de publicación">
        {[["published", "Publicados"], ["draft", "Borradores"]].map(([value, label]) => <button key={value} type="button" aria-pressed={status === value} onClick={() => setStatus(value)} className={`rounded-md px-3 py-2 text-xs ${status === value ? "bg-(--adech-surface) text-(--adech-title)" : "text-(--adech-muted)"}`}>{label} <span className="ml-2">{branches.filter((branch) => branch.status === value).length}</span></button>)}
      </div>
      <label className="flex items-center gap-3 rounded-lg border border-(--adech-border) bg-(--adech-surface) px-3 py-2 text-(--adech-muted)"><IconSearch size={20} /><input aria-label="Buscar Branches" placeholder="Buscar título o slug…" value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 bg-transparent text-sm text-(--adech-fg) outline-none" /></label>
    </div>
    {message && <p role="status" className="mt-4 text-sm">{message}</p>}
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {visible.map((branch) => <button key={branch.id} type="button" onClick={() => onSelect(branch.id)} className="flex min-h-28 flex-col gap-5 rounded-lg border border-(--adech-border) bg-(--adech-surface) p-4 text-left hover:border-(--adech-title)">
        <span className="flex w-full items-center justify-between text-xs"><span className="rounded-full bg-(--adech-surface-muted) px-2 py-1 text-(--adech-paragraph)">{branch.slug}</span><IconPalette size={20} /></span>
        <strong className="text-lg text-(--adech-title)">{branch.title}</strong>
      </button>)}
    </div>
    {!visible.length && <p className="mt-8 text-sm text-(--adech-muted)" role="status">{loading ? "Cargando Branches…" : "No hay Branches para mostrar."}</p>}
  </section>;
}
