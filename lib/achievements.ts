import { prisma } from "@/lib/prisma";
import { melbourneDate } from "@/lib/time";

export const ACHIEVEMENTS = [
  {
    slug: "linked-up",
    name: "Linked Up",
    description: "Linked a platform account to your profile.",
  },
  {
    slug: "party-starter",
    name: "Party Starter",
    description: "Posted your first LFG.",
  },
  {
    slug: "clipped",
    name: "Clipped",
    description: "Shared your first clip.",
  },
  {
    slug: "squad-up",
    name: "Squad Up",
    description: "Created or joined a squad.",
  },
  {
    slug: "highlight-reel",
    name: "Highlight Reel",
    description: "Shared 10 clips.",
  },
  {
    slug: "matchmaker",
    name: "Matchmaker",
    description: "Posted 10 LFG listings.",
  },
  {
    slug: "on-the-grid",
    name: "On the Grid",
    description: "Showed up 7 days in a row.",
  },
] as const;

export type AchievementSlug = (typeof ACHIEVEMENTS)[number]["slug"];

export function achievementMeta(slug: string) {
  return ACHIEVEMENTS.find((item) => item.slug === slug);
}

async function unlock(userId: string, slug: AchievementSlug) {
  await prisma.userAchievement.upsert({
    where: { userId_slug: { userId, slug } },
    create: { userId, slug },
    update: {},
  });
}

export async function recordActivity(userId: string) {
  const date = melbourneDate();
  await prisma.activityDay.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date },
    update: {},
  });
}

function melbourneDateOffset(daysAgo: number) {
  const [year, month, day] = melbourneDate().split("-").map(Number);
  const cursor = new Date(Date.UTC(year, month - 1, day));
  cursor.setUTCDate(cursor.getUTCDate() - daysAgo);
  return cursor.toISOString().slice(0, 10);
}

function hasSevenDayStreak(dates: string[]) {
  const set = new Set(dates);
  for (let i = 0; i < 7; i += 1) {
    if (!set.has(melbourneDateOffset(i))) return false;
  }
  return true;
}

export async function syncAchievements(userId: string) {
  await recordActivity(userId);

  const [links, lfgCount, clipCount, memberships, days] = await Promise.all([
    prisma.linkedAccount.count({ where: { userId } }),
    prisma.lfgPost.count({ where: { userId } }),
    prisma.clip.count({ where: { userId } }),
    prisma.squadMember.count({ where: { userId } }),
    prisma.activityDay.findMany({
      where: { userId },
      select: { date: true },
    }),
  ]);

  if (links > 0) await unlock(userId, "linked-up");
  if (lfgCount >= 1) await unlock(userId, "party-starter");
  if (lfgCount >= 10) await unlock(userId, "matchmaker");
  if (clipCount >= 1) await unlock(userId, "clipped");
  if (clipCount >= 10) await unlock(userId, "highlight-reel");
  if (memberships >= 1) await unlock(userId, "squad-up");
  if (hasSevenDayStreak(days.map((day) => day.date))) {
    await unlock(userId, "on-the-grid");
  }
}
