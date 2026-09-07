import { extractHashtags } from "@/lib/discovery/signals";

export function StreamMetadata({ stream, compact = false, onTagClick = null }) {
  if (!stream) return null;

  const hashtags = extractHashtags(stream.title);

  return (
    <div className="flex items-start gap-3 w-full overflow-hidden">
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={stream.avatarUrl}
          alt={stream.channelName}
          className={`${
            compact ? "w-8 h-8" : "w-10 h-10"
          } rounded-full border border-border/80 bg-surface-card object-cover`}
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-primary text-sm truncate hover:text-brand-gold transition-colors">
            {stream.channelName}
          </span>
          {stream.language && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-elevated text-text-muted border border-border/60 shrink-0">
              {stream.language}
            </span>
          )}
        </div>

        <p
          className={`text-xs text-text-secondary leading-snug line-clamp-1 ${
            compact ? "text-[11px]" : "text-xs"
          }`}
          title={stream.title}
        >
          {stream.title}
        </p>

        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <span className="text-[11px] font-medium text-brand-gold/90 truncate">
            {stream.category}
          </span>

          {hashtags.slice(0, 2).map((tag, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onTagClick) onTagClick(tag);
              }}
              className="text-[10px] px-1.5 py-0.5 rounded bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/25 transition-colors cursor-pointer border border-brand-orange/30"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
