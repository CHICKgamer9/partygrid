"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_REGION, REGIONS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/session";
import { syncAchievements } from "@/lib/achievements";
import type { ActionState } from "@/actions/auth";

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireOnboarded();
  const displayName = formString(formData, "displayName");
  const bio = formString(formData, "bio");
  const avatarUrl = formString(formData, "avatarUrl");
  const region = formString(formData, "region") || DEFAULT_REGION;
  const timezone = formString(formData, "timezone") || "Australia/Melbourne";
  const tagsRaw = formString(formData, "gameTags");

  if (displayName.length < 2) {
    return { error: "Display name needs at least 2 characters." };
  }
  if (!REGIONS.includes(region as (typeof REGIONS)[number])) {
    return { error: "Pick a valid region." };
  }
  if (bio.length > 500) {
    return { error: "Bio is a bit long — keep it under 500 characters." };
  }
  if (avatarUrl && !/^https?:\/\//i.test(avatarUrl)) {
    return { error: "Avatar needs to be an http(s) URL." };
  }

  const tags = tagsRaw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        displayName,
        name: displayName,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        region,
        timezone,
      },
    }),
    prisma.gameTag.deleteMany({ where: { userId: user.id } }),
    ...(tags.length
      ? [
          prisma.gameTag.createMany({
            data: tags.map((name) => ({ userId: user.id, name })),
          }),
        ]
      : []),
  ]);

  await syncAchievements(user.id);
  revalidatePath("/");
  revalidatePath(`/u/${user.id}`);
  revalidatePath("/settings");
  return { ok: true };
}
