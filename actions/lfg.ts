"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { syncAchievements } from "@/lib/achievements";
import { LFG_EXPIRY_HOURS, PLATFORMS, REGIONS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/session";
import { hoursFromNow } from "@/lib/time";
import type { ActionState } from "@/actions/auth";

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseLfg(formData: FormData) {
  const game = formString(formData, "game");
  const platform = formString(formData, "platform");
  const rank = formString(formData, "rank");
  const rolesNeeded = formString(formData, "rolesNeeded");
  const region = formString(formData, "region");
  const voice = formData.get("voice") === "on" || formData.get("voice") === "yes";
  const discordLink = formString(formData, "discordLink");
  const hours = Number(formString(formData, "expiresInHours") || "6");

  if (game.length < 2) return { error: "Add the game you're queuing." };
  if (!PLATFORMS.includes(platform as (typeof PLATFORMS)[number])) {
    return { error: "Pick a platform." };
  }
  if (!REGIONS.includes(region as (typeof REGIONS)[number])) {
    return { error: "Pick a region." };
  }
  if (
    !LFG_EXPIRY_HOURS.includes(hours as (typeof LFG_EXPIRY_HOURS)[number])
  ) {
    return { error: "Expiry must be between 2 and 24 hours." };
  }
  if (discordLink && !/^https?:\/\//i.test(discordLink)) {
    return { error: "Discord link should start with http(s)." };
  }

  return {
    data: {
      game,
      platform,
      rank: rank || null,
      rolesNeeded: rolesNeeded || null,
      region,
      voice,
      discordLink: discordLink || null,
      expiresAt: hoursFromNow(hours),
    },
  };
}

export async function createLfgAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireOnboarded();
  const parsed = parseLfg(formData);
  if ("error" in parsed && parsed.error) return { error: parsed.error };
  if (!("data" in parsed) || !parsed.data) return { error: "Could not save LFG." };

  const post = await prisma.lfgPost.create({
    data: { ...parsed.data, userId: user.id },
  });
  await syncAchievements(user.id);
  revalidatePath("/");
  revalidatePath("/lfg");
  redirect(`/lfg/${post.id}`);
}

export async function updateLfgAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireOnboarded();
  const id = formString(formData, "id");
  const existing = await prisma.lfgPost.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return { error: "You can only edit your own LFG." };
  }
  const parsed = parseLfg(formData);
  if ("error" in parsed && parsed.error) return { error: parsed.error };
  if (!("data" in parsed) || !parsed.data) return { error: "Could not save LFG." };

  await prisma.lfgPost.update({
    where: { id },
    data: parsed.data,
  });
  await syncAchievements(user.id);
  revalidatePath("/");
  revalidatePath("/lfg");
  revalidatePath(`/lfg/${id}`);
  redirect(`/lfg/${id}`);
}

export async function deleteLfgAction(formData: FormData) {
  const user = await requireOnboarded();
  const id = formString(formData, "id");
  const existing = await prisma.lfgPost.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    throw new Error("You can only delete your own LFG.");
  }
  await prisma.lfgPost.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/lfg");
  redirect("/lfg");
}
