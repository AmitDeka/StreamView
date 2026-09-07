import { Radio } from "lucide-react";

export function LiveBadge({ size = "md", className = "" }) {
  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md border border-live/40 text-live ${
        isSmall ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
      </span>
      <span>LIVE</span>
    </span>
  );
}
