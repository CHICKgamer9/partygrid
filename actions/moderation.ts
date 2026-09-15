"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/session";
import type { ActionState } from "@/actions/auth";

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function reportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireOnboarded();
  const targetType = formString(formData, "targetType");
  const targetId = formString(formData, "targetId");
  const reportedId = formString(formData, "reportedId") || null;
  const reason = formString(formData, "reason");
  const details = formString(formData, "details");

  if (!targetType || !targetId) return { error: "Missing report target." };
  if (reason.length < 3) return { error: "Tell us why you're reporting this." };
  if (reportedId === user.id) return { error: "You can't report yourself." };

  await prisma.report.create({
    data: {
      reporterId: user.id,
      reportedId,
      reason,
      details: details || null,
      targetType,
      targetId,
    },
  });
  return { ok: true };
}

export async function blockUserAction(formData: FormData) {
  const user = await requireOnboarded();
  const blockedId = formString(formData, "blockedId");
  if (!blockedId || blockedId === user.id) {
    throw new Error("Invalid block target.");
  }
  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: user.id, blockedId } },
    create: { blockerId: user.id, blockedId },
    update: {},
  });
  revalidatePath("/");
  revalidatePath("/lfg");
  revalidatePath("/clips");
  revalidatePath("/settings/safety");
  redirect("/settings/safety");
}

export async function unblockUserAction(formData: FormData) {
  const user = await requireOnboarded();
  const blockedId = formString(formData, "blockedId");
  await prisma.block.deleteMany({
    where: { blockerId: user.id, blockedId },
  });
  revalidatePath("/settings/safety");
  revalidatePath("/");
}

export async function claimLinkedAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { upsertLinkedAccount } = await import("@/lib/links");
  const { resolveSteamClaim } = await import("@/lib/steam");
  const user = await requireOnboarded();
  const platform = formString(formData, "platform");
  const handle = formString(formData, "handle");
  if (!handle) return { error: "Add a gamertag or profile URL." };

  if (platform === "steam") {
    const resolved = await resolveSteamClaim(handle);
    if (resolved && process.env.STEAM_API_KEY) {
      await upsertLinkedAccount({
        userId: user.id,
        platform: "steam",
        handle: resolved.personaName,
        verified: true,
        profileUrl: resolved.profileUrl,
        externalId: resolved.steamId,
      });
    } else {
      await upsertLinkedAccount({
        userId: user.id,
        platform: "steam",
        handle,
        verified: false,
        profileUrl: handle.startsWith("http") ? handle : null,
      });
    }
    revalidatePath("/settings/accounts");
    revalidatePath(`/u/${user.id}`);
    return { ok: true };
  }

  const allowed = ["discord", "xbox", "psn", "riot", "epic"];
  if (!allowed.includes(platform)) return { error: "Unknown platform." };

  await upsertLinkedAccount({
    userId: user.id,
    platform,
    handle,
    verified: false,
  });
  revalidatePath("/settings/accounts");
  revalidatePath(`/u/${user.id}`);
  return { ok: true };
}

export async function unlinkAccountAction(formData: FormData) {
  const user = await requireOnboarded();
  const platform = formString(formData, "platform");
  await prisma.linkedAccount.deleteMany({
    where: { userId: user.id, platform },
  });
  revalidatePath("/settings/accounts");
  revalidatePath(`/u/${user.id}`);
}
