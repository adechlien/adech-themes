import { useEffect, useRef, useState } from "react";
import CopyButton from "../components/CopyButton";
import { fetchColorName, formatColor, readableText, rgbToHex } from "./colorUtils";
import { IconColorPicker } from '@tabler/icons-react';

export default function ColorPicker() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const [selected, setSelected] = useState("#A1C4FF");
  const [selectedName, setSelectedName] = useState("");

  const canUseEyeDropper =
    typeof window !== "undefined" && typeof window.EyeDropper !== "undefined";

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    const controller = new AbortController();

    fetchColorName(selected, controller.signal).then(setSelectedName);

    return () => controller.abort();
  }, [selected]);

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

    if (commit) {
      setSelected(hex);
    }
  };

  const onFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
  };

  const useEyeDropper = async () => {
    const dropper = new window.EyeDropper();
    const result = await dropper.open();
    setSelected(result.sRGBHex.toUpperCase());
  };

  const textColor = readableText(selected);
  const copyButtonStyle = {
    color: textColor,
    backgroundColor: `${textColor}18`,
    boxShadow: `inset 0 0 0 1px ${textColor}30`,
  };

  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={useEyeDropper} className="rounded-lg bg-(--adech-nav-bg-active) p-2 text-sm font-medium text-(--adech-nav-fg-active) disabled:opacity-50" disabled={!canUseEyeDropper}>
            <IconColorPicker size={18} stroke={2} />
          </button>
          <label className="rounded-lg bg-(--adech-nav-bg-active) px-3 py-2 text-sm font-semibold text-(--adech-nav-fg-active) cursor-pointer">
            Upload photo
            <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
          </label>
        </div>

        <div className="overflow-hidden rounded-lg bg-(--adech-surface) ring-1 ring-(--adech-border)">
          {imageUrl ? (
            <>
              <img ref={imageRef} src={imageUrl} alt="" className="hidden" onLoad={drawImage} />
              <canvas ref={canvasRef} className="block max-h-[520px] w-full cursor-crosshair object-contain" onMouseMove={(event) => pickFromCanvas(event)} onClick={(event) => pickFromCanvas(event, true)} />
            </>
          ) : (
            <div className="flex min-h-72 items-center justify-center p-8 text-center text-sm text-(--adech-paragraph)">
              Load a photo to sample pixels, or use the screen picker when the browser supports it.
            </div>
          )}
        </div>
      </div>

      <div className="flex h-full flex-col gap-4">
        <div className="flex h-full min-h-44 flex-col justify-between rounded-lg p-3 lg:min-h-full" style={{ backgroundColor: selected, color: textColor }}>
          <div>
            <p className="text-xl font-semibold">{selectedName || selected}</p>
            <p className="text-base font-semibold">{selected}</p>
            <p className="text-base font-semibold">{formatColor(selected, "rgb")}</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-md p-2 text-xs font-semibold" style={copyButtonStyle}>
              <CopyButton value={selected} iconOnly className="text-current" title="Copy HEX" ariaLabel="Copy HEX" />
              HEX
            </span>
            <span className="flex items-center gap-1 rounded-md p-2 text-xs font-semibold" style={copyButtonStyle}>
              <CopyButton value={formatColor(selected, "rgb")} iconOnly className="text-current" title="Copy RGB" ariaLabel="Copy RGB" />
              RGB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
