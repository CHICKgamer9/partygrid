import { ACHIEVEMENTS, achievementMeta } from "@/lib/achievements";

export function BadgeRow({
  unlocked,
}: {
  unlocked: { slug: string; unlockedAt: Date }[];
}) {
  const have = new Set(unlocked.map((item) => item.slug));
  return (
    <div className="flex flex-wrap gap-2">
      {ACHIEVEMENTS.map((badge) => {
        const on = have.has(badge.slug);
        const meta = achievementMeta(badge.slug);
        return (
          <span
            key={badge.slug}
            title={meta?.description}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              on
                ? "border-accent/40 bg-accent/15 text-accent"
                : "border-line bg-white/5 text-muted/60"
            }`}
          >
            {on ? "★ " : ""}
            {badge.name}
          </span>
        );
      })}
    </div>
  );
}
