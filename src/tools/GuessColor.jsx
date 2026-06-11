import { useEffect, useMemo, useState } from "react";
import CopyButton from "../components/CopyButton";
import { IconHelpCircle } from "@tabler/icons-react";
import {
  fetchColorName,
  formatColor,
  hexToRgb,
  normalizeHex,
  parseRgb,
  randomHex,
  readableText,
  rgbToHex,
} from "./colorUtils";

const LEVELS = [
  { id: "practice", label: "10", attempts: 10 },
  { id: "normal", label: "6", attempts: 6 },
  { id: "hard", label: "3", attempts: 3 },
  { id: "sudden", label: "1", attempts: 1 },
];

function scoreGuess(targetHex, guessHex) {
  const target = hexToRgb(targetHex);
  const guess = hexToRgb(guessHex);
  if (!target || !guess) return null;

  const channels = ["r", "g", "b"].map((channel) => {
    const diff = Math.abs(target[channel] - guess[channel]);

    return {
      channel,
      score: Math.max(0, Math.round(100 - diff / 2.55)),
      direction:
        guess[channel] === target[channel]
          ? "exact"
          : guess[channel] < target[channel]
            ? "higher"
            : "lower",
    };
  });

  const distance = Math.sqrt(
    (target.r - guess.r) ** 2 + (target.g - guess.g) ** 2 + (target.b - guess.b) ** 2
  );
  const score = Math.max(0, Math.round(100 - (distance / 441.67) * 100));

  return { score, channels };
}

function parseGuess(format, hexValue, rgbValue) {
  if (format === "rgb") {
    const rgb = parseRgb(rgbValue);
    return rgb ? rgbToHex(rgb) : null;
  }

  return normalizeHex(hexValue);
}

function messageFor(score, won, done) {
  if (won) return "Perfect match";
  if (done) return "No attempts left";
  if (score >= 95) return "Almost exact";
  if (score >= 85) return "Very close";
  if (score >= 70) return "Warm";
  if (score >= 50) return "Getting there";
  return "Keep searching";
}

function GuessInfo() {
  return (
    <div className="group relative">
      <button
        type="button"
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-(--adech-title)"
        aria-label="Explain Color Guess"
      >
        <IconHelpCircle size={18} stroke={2} />
      </button>
      <p className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-20 w-72 rounded-lg bg-(--adech-surface) p-3 text-left text-xs leading-relaxed text-(--adech-paragraph) opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
        Guess the hidden color in HEX or RGB. Each channel shows how close your
        red, green, and blue values are, plus whether that channel should go
        higher or lower.
      </p>
    </div>
  );
}

function ChannelHint({ item }) {
  const channelColors = {
    r: "#F00",
    g: "#0F0",
    b: "#00F",
  };

  return (
    <div className="rounded-lg bg-(--adech-surface-strong) px-3 py-2 text-adech-venomous-2 text-center ring-1 ring-(--adech-border)" style={{ backgroundColor: channelColors[item.channel] }}>
      <p className="text-lg font-semibold">
        {item.score}%
      </p>
      <p className="text-xs">{item.direction}</p>
    </div>
  );
}

function AttemptPill({ attempt, number }) {
  return (
    <div className="flex shrink-0 items-center gap-4 rounded-full bg-(--adech-surface) p-1 ring-1 ring-(--adech-border) lg:w-44">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ring-1 ring-(--adech-border)"
        style={{ backgroundColor: attempt.guess, color: readableText(attempt.guess) }}
      >
        {attempt.score}%
      </span>
      <div className="min-w-0 text-left">
        <p className="truncate text-xs font-semibold leading-tight text-(--adech-title)">
          {attempt.guess}
        </p>
        <p className="truncate text-[11px] leading-tight text-(--adech-paragraph)">
          {attempt.rgb}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold text-(--adech-title)">
        {number}
      </p>
    </div>
  );
}

export default function GuessColor() {
  const [target, setTarget] = useState(() => randomHex());
  const [targetName, setTargetName] = useState("");
  const [format, setFormat] = useState("hex");
  const [level, setLevel] = useState(LEVELS[1]);
  const [hexInput, setHexInput] = useState("");
  const [rgbInput, setRgbInput] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [revealed, setRevealed] = useState(false);

  const lastAttempt = attempts[0];
  const won = Boolean(lastAttempt?.channels.every((item) => item.score === 100));
  const done = won || attempts.length >= level.attempts;
  const attemptsLeft = Math.max(0, level.attempts - attempts.length);
  const targetRgb = useMemo(() => formatColor(target, "rgb"), [target]);
  const targetText = readableText(target);
  const guessBg = lastAttempt?.guess || "var(--adech-surface-strong)";
  const guessText = lastAttempt?.guess ? readableText(lastAttempt.guess) : "var(--adech-paragraph)";

  useEffect(() => {
    const controller = new AbortController();

    fetchColorName(target, controller.signal).then(setTargetName);

    return () => controller.abort();
  }, [target]);

  const reset = (nextLevel = level) => {
    setTarget(randomHex());
    setTargetName("");
    setHexInput("");
    setRgbInput("");
    setAttempts([]);
    setRevealed(false);
    setLevel(nextLevel);
  };

  const submit = async () => {
    if (done) return;

    const guess = parseGuess(format, hexInput, rgbInput);
    if (!guess) return;

    const result = scoreGuess(target, guess);
    if (!result) return;

    const name = await fetchColorName(guess);
    const isCorrect = result.channels.every((item) => item.score === 100);
    const nextDone = isCorrect || attempts.length + 1 >= level.attempts;

    setAttempts((current) => [
      {
        guess,
        name,
        rgb: formatColor(guess, "rgb"),
        score: result.score,
        channels: result.channels,
        message: messageFor(result.score, isCorrect, nextDone),
      },
      ...current,
    ]);
    setHexInput("");
    setRgbInput("");
  };

  return (
    <div className="relative min-h-[620px] overflow-hidden rounded-lg ring-1 ring-(--adech-border)">
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
        <div className="flex items-end justify-start p-4 text-left lg:items-center lg:justify-center lg:p-8 lg:text-center" style={{ backgroundColor: target, color: targetText }}>
          <div className="max-w-xs">
            <p className="text-xs opacity-80">Target</p>
            <p className="text-3xl font-semibold">
              {revealed || won || done ? target : "Hidden"}
            </p>
            <p className="text-sm opacity-85">
              {revealed || won || done ? targetRgb : "Guess the color code"}
            </p>
            <p className="text-lg font-semibold">
              {revealed || won || done ? targetName : ""}
            </p>
          </div>
        </div>

        <div className="flex items-end justify-start p-4 text-left lg:items-center lg:justify-center lg:p-8 lg:text-center" style={{ background: guessBg, color: guessText }}>
          <div className="max-w-xs">
            <p className="text-xs opacity-80">Last guess</p>
            <p className="text-3xl font-semibold">
              {lastAttempt?.guess || "No guess"}
            </p>
            <p className="text-sm opacity-85">
              {lastAttempt?.rgb || "Submit a HEX or RGB value"}
            </p>
            <p className="text-lg font-semibold">
              {lastAttempt?.name || ""}
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 lg:inset-0 flex items-center justify-center p-4">
        <div className="flex flex-col gap-2 pointer-events-auto w-full max-w-72 rounded-xl bg-(--adech-surface) p-4 text-center shadow-[0_18px_60px_rgba(0,0,0,0.25)] ring-1 ring-(--adech-border)">
          <div className="flex items-start justify-between gap-3">
            <span className="h-8 w-8" />
            <p className="min-w-0 flex-1 text-2xl font-semibold text-(--adech-title)">
              {lastAttempt ? lastAttempt.message : "Guess it"}
            </p>
            <GuessInfo />
          </div>
          <p className="mt-1 text-sm text-(--adech-paragraph)">
            {attemptsLeft} attempts left
          </p>

          <div className="grid grid-cols-4 gap-1 rounded-lg bg-(--adech-nav-bg) p-1 text-(--adech-nav-fg)">
            {LEVELS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => reset(item)}
                className={[
                  "rounded-lg px-2 py-1 text-sm transition",
                  level.id === item.id
                    ? "bg-(--adech-nav-bg-active) text-(--adech-nav-fg-active)"
                    : "",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between gap-2">
            <div className="flex justify-between items-center gap-2 rounded-lg bg-(--adech-nav-bg) p-1 text-(--adech-nav-fg)">
              {["hex", "rgb"].map((item) => (
                <button key={item} type="button" onClick={() => setFormat(item)} className={[
                  "rounded-lg px-3 py-1 text-sm uppercase transition",
                  format === item
                    ? "bg-(--adech-nav-bg-active) text-(--adech-nav-fg-active)"
                    : "",
                  ].join(" ")}
                >
                  {item}
                </button>
              ))}
            </div>
            {format === "hex" ? (
              <input value={hexInput} onChange={(event) => setHexInput(event.target.value.replace(/[^0-9a-fA-F#]/g, "").toUpperCase())}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submit();
                }} placeholder="#A1C4FF" className="w-full rounded-lg bg-(--adech-surface-strong) px-3 text-center text-(--adech-fg) outline-none ring-1 ring-(--adech-border)"
              />
            ) : (
              <input value={rgbInput} onChange={(event) => setRgbInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submit();
                }} placeholder="161, 196, 255" className="w-full rounded-lg bg-(--adech-surface-strong) px-3 text-center text-(--adech-fg) outline-none ring-1 ring-(--adech-border)"
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={done}
              className="rounded-lg bg-(--adech-nav-bg-active) px-3 py-2 text-sm font-medium text-(--adech-nav-fg-active) disabled:opacity-50"
            >
              Guess
            </button>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-lg bg-(--adech-surface-strong) px-3 py-2 text-sm font-medium text-(--adech-title) ring-1 ring-(--adech-border)"
            >
              Reveal
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-(--adech-surface-strong) px-3 py-2 text-sm font-medium text-(--adech-title) ring-1 ring-(--adech-border)"
            >
              New
            </button>
          </div>

          {lastAttempt ? (
            <div className="grid grid-cols-3 gap-2">
              {lastAttempt.channels.map((item) => (
                <ChannelHint key={item.channel} item={item} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {attempts.length > 0 && (
        <div className="absolute left-3 right-3 top-3 z-10 flex gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:justify-center lg:overflow-visible lg:pb-0">
          {attempts.map((attempt, index) => (
            <AttemptPill key={`${attempt.guess}-${index}`} attempt={attempt} number={attempts.length - index} />
          ))}
        </div>
      )}
    </div>
  );
}
