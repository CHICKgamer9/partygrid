import { ACHIEVEMENTS, achievementMeta } from "@/lib/achievements";

export function BadgeRow({
  unlocked,
}: {
  unlocked: { slug: string; unlockedAt: Date }[];
}) {
  const have = new Set(unlocked.map((item) => item.slug));
  const unlockedCount = ACHIEVEMENTS.filter((badge) => have.has(badge.slug)).length;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">
        {unlockedCount} of {ACHIEVEMENTS.length} unlocked
      </p>
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
                  ? "border-accent bg-accent text-black shadow-[0_0_16px_rgba(61,255,176,0.25)]"
                  : "border-dashed border-line bg-transparent text-muted/50"
              }`}
            >
              {on ? "★ " : "○ "}
              {badge.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
