import { useEffect, useRef, useState } from "react";
import { formatColor, readableText, rgbToHex } from "./colorUtils";

function CopyButton({ value, children }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // noop
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-lg bg-(--adech-nav-bg-active) px-3 py-2 text-sm font-medium text-(--adech-nav-fg-active)"
    >
      {copied ? "Copied" : children}
    </button>
  );
}

export default function ColorPicker() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const [selected, setSelected] = useState("#A1C4FF");
  const [hovered, setHovered] = useState(null);
  const [message, setMessage] = useState("Upload an image or use the screen picker.");

  const canUseEyeDropper =
    typeof window !== "undefined" && typeof window.EyeDropper !== "undefined";

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const maxWidth = 920;
    const scale = Math.min(1, maxWidth / image.naturalWidth);
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  };

  const pickFromCanvas = (event, commit = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * canvas.height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const pixel = context.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex({ r: pixel[0], g: pixel[1], b: pixel[2] });

    setHovered(hex);
    if (commit) {
      setSelected(hex);
      setMessage("Color picked from image.");
    }
  };

  const onFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    setMessage("Click the image to pick a color.");
  };

  const useEyeDropper = async () => {
    if (!canUseEyeDropper) {
      setMessage("Screen picker is not available in this browser.");
      return;
    }

    try {
      const dropper = new window.EyeDropper();
      const result = await dropper.open();
      setSelected(result.sRGBHex.toUpperCase());
      setMessage("Color picked from the screen.");
    } catch {
      setMessage("Screen pick cancelled.");
    }
  };

  const display = hovered || selected;
  const textColor = readableText(selected);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-xl bg-(--adech-surface-strong) p-4 ring-1 ring-(--adech-border)">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="rounded-lg bg-(--adech-surface) px-3 py-2 text-sm font-medium text-(--adech-title) ring-1 ring-(--adech-border) cursor-pointer">
            Upload photo
            <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
          </label>

          <button
            type="button"
            onClick={useEyeDropper}
            className="rounded-lg bg-(--adech-nav-bg-active) px-3 py-2 text-sm font-medium text-(--adech-nav-fg-active) disabled:opacity-50"
            disabled={!canUseEyeDropper}
          >
            Pick from screen
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg bg-(--adech-surface) ring-1 ring-(--adech-border)">
          {imageUrl ? (
            <>
              <img
                ref={imageRef}
                src={imageUrl}
                alt=""
                className="hidden"
                onLoad={drawImage}
              />
              <canvas
                ref={canvasRef}
                className="block max-h-[520px] w-full cursor-crosshair object-contain"
                onMouseMove={(event) => pickFromCanvas(event)}
                onMouseLeave={() => setHovered(null)}
                onClick={(event) => pickFromCanvas(event, true)}
              />
            </>
          ) : (
            <div className="flex min-h-72 items-center justify-center p-8 text-center text-sm text-(--adech-paragraph)">
              Load a photo to sample pixels, or use the screen picker when the browser supports it.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div
          className="min-h-44 rounded-xl p-5 ring-1 ring-(--adech-border)"
          style={{ backgroundColor: selected, color: textColor }}
        >
          <p className="text-xs opacity-80">Selected</p>
          <p className="mt-8 text-3xl font-semibold">{selected}</p>
          <p className="mt-1 text-sm opacity-85">{formatColor(selected, "rgb")}</p>
        </div>

        <div className="rounded-xl bg-(--adech-surface-strong) p-4 ring-1 ring-(--adech-border)">
          <p className="text-xs text-(--adech-muted)">Current hover</p>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="h-10 w-10 rounded-lg ring-1 ring-(--adech-border)"
              style={{ backgroundColor: display }}
            />
            <div>
              <p className="text-sm font-semibold text-(--adech-title)">{display}</p>
              <p className="text-xs text-(--adech-paragraph)">
                {formatColor(display, "rgb")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <CopyButton value={selected}>Copy HEX</CopyButton>
          <CopyButton value={formatColor(selected, "rgb")}>Copy RGB</CopyButton>
        </div>

        <p className="text-sm text-(--adech-paragraph)">{message}</p>
      </div>
    </div>
  );
}
