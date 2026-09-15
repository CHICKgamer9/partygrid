"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { syncAchievements } from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/session";
import type { ActionState } from "@/actions/auth";

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return base || "squad";
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  let i = 0;
  while (await prisma.squad.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}

export async function createSquadAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireOnboarded();
  const name = formString(formData, "name");
  const bio = formString(formData, "bio");
  const games = formString(formData, "games");
  const discordLink = formString(formData, "discordLink");

  if (name.length < 2) return { error: "Squad name needs at least 2 characters." };
  if (bio.length > 400) return { error: "Bio must be under 400 characters." };
  if (discordLink && !/^https?:\/\//i.test(discordLink)) {
    return { error: "Discord link should start with http(s)." };
  }

  const slug = await uniqueSlug(name);
  const squad = await prisma.squad.create({
    data: {
      name,
      slug,
      bio: bio || null,
      games,
      discordLink: discordLink || null,
      creatorId: user.id,
      members: { create: { userId: user.id } },
    },
  });
  await syncAchievements(user.id);
  revalidatePath("/squads");
  redirect(`/squads/${squad.slug}`);
}

export async function joinSquadAction(formData: FormData) {
  const user = await requireOnboarded();
  const slug = formString(formData, "slug");
  const squad = await prisma.squad.findUnique({ where: { slug } });
  if (!squad) throw new Error("Squad not found.");
  await prisma.squadMember.upsert({
    where: { squadId_userId: { squadId: squad.id, userId: user.id } },
    create: { squadId: squad.id, userId: user.id },
    update: {},
  });
  await syncAchievements(user.id);
  revalidatePath(`/squads/${slug}`);
  revalidatePath("/squads");
}

export async function leaveSquadAction(formData: FormData) {
  const user = await requireOnboarded();
  const slug = formString(formData, "slug");
  const squad = await prisma.squad.findUnique({ where: { slug } });
  if (!squad) throw new Error("Squad not found.");
  await prisma.squadMember.deleteMany({
    where: { squadId: squad.id, userId: user.id },
  });
  revalidatePath(`/squads/${slug}`);
  revalidatePath("/squads");
}

export async function updateSquadAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireOnboarded();
  const slug = formString(formData, "slug");
  const squad = await prisma.squad.findUnique({ where: { slug } });
  if (!squad || squad.creatorId !== user.id) {
    return { error: "Only the squad creator can edit this page." };
  }
  const name = formString(formData, "name");
  const bio = formString(formData, "bio");
  const games = formString(formData, "games");
  const discordLink = formString(formData, "discordLink");
  if (name.length < 2) return { error: "Squad name needs at least 2 characters." };
  if (discordLink && !/^https?:\/\//i.test(discordLink)) {
    return { error: "Discord link should start with http(s)." };
  }
  await prisma.squad.update({
    where: { id: squad.id },
    data: {
      name,
      bio: bio || null,
      games,
      discordLink: discordLink || null,
    },
  });
  revalidatePath(`/squads/${slug}`);
  return { ok: true };
}
