import { prisma } from "@/lib/prisma";
import { syncAchievements } from "@/lib/achievements";

export async function upsertLinkedAccount(input: {
  userId: string;
  platform: string;
  handle: string;
  verified: boolean;
  profileUrl?: string | null;
  externalId?: string | null;
}) {
  await prisma.linkedAccount.upsert({
    where: {
      userId_platform: { userId: input.userId, platform: input.platform },
    },
    create: {
      userId: input.userId,
      platform: input.platform,
      handle: input.handle,
      verified: input.verified,
      profileUrl: input.profileUrl ?? null,
      externalId: input.externalId ?? null,
    },
    update: {
      handle: input.handle,
      verified: input.verified,
      profileUrl: input.profileUrl ?? null,
      externalId: input.externalId ?? null,
    },
  });
  await syncAchievements(input.userId);
}

export function platformLabel(platform: string) {
  const labels: Record<string, string> = {
    discord: "Discord",
    steam: "Steam",
    xbox: "Xbox",
    psn: "PlayStation",
    riot: "Riot",
    epic: "Epic",
    google: "Google",
  };
  return labels[platform] ?? platform;
}
