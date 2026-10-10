export default function Home() {
  return (
    <div className="flex flex-col gap-20 sm:gap-32 animate-tabEnter">
      <section className="flex max-w-3xl flex-col items-start gap-6">
        <p className="text-sm font-medium uppercase tracking-widest text-(--adech-hero-subtitle)">Adech Design System</p>
        <h1 className="text-5xl font-semibold sm:text-7xl">A language for your interfaces.</h1>
        <p className="max-w-2xl text-base leading-relaxed text-(--adech-hero-paragraph) sm:text-lg">Adech is an evolving design system by Adechlien. A place for themes, typography, components, icons, and the details that shape an interface.</p>
        <p className="max-w-2xl text-sm leading-relaxed text-(--adech-paragraph)">It starts with Adech Themes: reusable color systems for your projects and workspaces, with Superior as the first Branch.</p>
        <a href="/themes" className="rounded-lg bg-(--adech-hero-bg-button) px-5 py-3 font-medium text-(--adech-hero-fg-button)">Explore Themes</a>
      </section>
      <section aria-labelledby="explore-heading" className="flex flex-col gap-6">
        <h2 id="explore-heading" className="text-4xl font-bebas text-(--adech-title)">Explore Adech</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <a href="/themes" className="flex flex-col items-start gap-4 rounded-xl bg-(--adech-surface) p-8 transition hover:bg-(--adech-surface-strong)">
            <span className="text-xs uppercase tracking-widest text-(--adech-hero-subtitle)">Available now</span>
            <h3 className="text-3xl font-semibold">Themes</h3>
            <p className="text-(--adech-paragraph)">Meet the Branches, explore their palettes, and bring Adech to your projects and workspaces.</p>
            <span className="mt-auto text-sm font-semibold">Discover Themes →</span>
          </a>
          <a href="/tools" className="flex flex-col items-start gap-4 rounded-xl bg-(--adech-surface) p-8 transition hover:bg-(--adech-surface-strong)">
            <span className="text-xs uppercase tracking-widest text-(--adech-hero-subtitle)">Design utilities</span>
            <h3 className="text-3xl font-semibold">Tools</h3>
            <p className="text-(--adech-paragraph)">Check contrast, sample colors, and explore palettes. A growing collection of tools across Adech.</p>
            <span className="mt-auto text-sm font-semibold">Open Tools →</span>
          </a>
        </div>
      </section>
    </div>
  );
}
