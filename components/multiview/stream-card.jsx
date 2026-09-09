import { Plus, Check } from "lucide-react";

export function StreamCard({
  stream,
  isSelected = false,
  onSelect,
  onTagClick,
  disabled = false,
}) {
  if (!stream) return null;

  return (
    <div
      onClick={() => {
        if (!disabled && onSelect) onSelect(stream);
      }}
      className={`group relative flex flex-col rounded-xl overflow-hidden transition-all duration-200 border cursor-pointer ${
        isSelected
          ? "bg-surface-elevated border-brand-gold/80 shadow-glow-gold ring-1 ring-brand-gold/60"
          : "bg-surface-card border-border/70 hover:border-brand-orange/60 hover:bg-surface-hover"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full bg-surface-card overflow-hidden">
        <img
          src={stream.thumbnailUrl}
          alt={stream.title}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop&q=80";
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />


        {/* Live Status Badge */}
        {stream.isLive ? (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-live text-white font-extrabold text-[10px] tracking-wider uppercase shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>LIVE</span>
          </div>
        ) : (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 font-bold text-[10px] uppercase shadow-md">
            OFFLINE
          </div>
        )}

        {/* Live Viewer Count Badge */}
        {stream.isLive && typeof stream.viewerCount === "number" && stream.viewerCount > 0 && (
          <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white font-medium text-[10px] border border-white/10 shadow-md">
            {stream.viewerCount >= 1000
              ? `${(stream.viewerCount / 1000).toFixed(1)}k viewers`
              : `${stream.viewerCount} viewers`}
          </div>
        )}

        {/* Selected Indicator Badge on thumbnail */}
        {isSelected && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold text-black font-bold text-xs tracking-wider uppercase shadow-lg">
              <Check className="w-4 h-4 stroke-[3]" />
              Selected
            </span>
          </div>
        )}
      </div>

      {/* Stream Info Area */}
      <div className="p-3.5 flex flex-col gap-2 flex-1 justify-between">
        <div className="flex items-start gap-2.5">
          <img
            src={stream.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${stream.channelName}&backgroundColor=b6e3f4,c0aede`}
            alt={stream.channelName}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${stream.channelName}&backgroundColor=b6e3f4,c0aede`;
            }}
            className="w-8 h-8 rounded-full border border-border/80 object-cover shrink-0 mt-0.5"
            loading="lazy"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-text-primary text-sm truncate group-hover:text-brand-gold transition-colors">
                {stream.channelName}
              </span>
              {stream.language && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border/40 shrink-0">
                  {stream.language}
                </span>
              )}
            </div>

            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mt-0.5" title={stream.title}>
              {stream.title}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
          <span className="text-[11px] font-semibold text-brand-gold/90 truncate max-w-[65%]">
            {stream.category}
          </span>

          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled && onSelect) onSelect(stream);
            }}
            className={`flex items-center justify-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              isSelected
                ? "bg-brand-gold/20 text-brand-gold border border-brand-gold/50"
                : "bg-surface-elevated text-text-primary border border-border hover:bg-brand-orange hover:text-white hover:border-brand-orange"
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
