import { Users } from "lucide-react";
import { formatViewerCount } from "@/lib/utils";

export function ViewerCount({ count, size = "md", className = "" }) {
  if (count === undefined || count === null) return null;
  const num = Number(count);
  if (isNaN(num) || num <= 0) return null;

  const isSmall = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-semibold bg-black/75 backdrop-blur-md border border-border/70 text-text-primary ${
        isSmall ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs"
      } ${className}`}
    >
      <Users className={`${isSmall ? "w-3 h-3 text-brand-orange" : "w-3.5 h-3.5 text-brand-orange"}`} />
      <span>{formatViewerCount(count)}</span>
    </span>
  );
}
