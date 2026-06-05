import { IconPalette, IconContrast } from '@tabler/icons-react';

const ITEMS = [
  {
    Icon: IconPalette,
    title: "Guess the color",
    description: "Adivina el color (HEX/RGB) con pistas de distancia y contraste.",
  },
  {
    Icon: IconPalette,
    title: "Color Wheel",
    description: "Armonías: complementarios, análogos, triadas y sugerencias rápidas.",
  },
  {
    Icon: IconPalette,
    title: "Gradient Builder",
    description: "Construye gradientes con tokens Adech y exporta CSS/Tailwind.",
  },
  {
    Icon: IconContrast,
    title: "Contrast Checker",
    description: "Verifica legibilidad AA/AAA entre tokens (ideal para UI).",
  },
];

function SoonCard({ Icon, title, description }) {
  return (
    <div className="flex flex-col items-end justify-between gap-6 rounded-lg bg-(--adech-surface) p-4 ring-1 ring-(--adech-border)">
      <div className="flex items-start gap-3">
        <div className="grid place-items-center text-6xl text-(--adech-muted)">
          {Icon ? <Icon stroke={2} size={48} /> : null}
        </div>
        <div className="min-w-0 max-w-48">
          <p className="text-lg font-semibold text-(--adech-title)">{title}</p>
          <p className="text-sm text-(--adech-paragraph)">{description}</p>
        </div>
      </div>

      <span className="text-xs text-(--adech-muted)">
        Coming soon
      </span>
    </div>
  );
}

export default function ComingSoon() {
  return (
    <section id="lab" className="flex flex-col items-center justify-between gap-10">
      <div className="flex flex-col flex-wrap items-center justify-between gap-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-(--adech-title)">
            Coming Soon
          </h2>
          <p className="text-sm max-w-xl text-(--adech-paragraph)">
            Tools para explorar y combinar colores con Adech. Empezamos simple y
            escalamos con utilidades útiles para diseño y frontend.
          </p>
      </div>

      <div className="flex gap-4">
        {ITEMS.map((it) => (
          <SoonCard key={it.title} {...it} />
        ))}
      </div>
    </section>
  );
}
