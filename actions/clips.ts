"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { syncAchievements } from "@/lib/achievements";
import { isSupportedClipUrl } from "@/lib/clips";
import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/session";
import type { ActionState } from "@/actions/auth";

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createClipAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireOnboarded();
  const url = formString(formData, "url");
  const title = formString(formData, "title");
  const gameTag = formString(formData, "gameTag");
  const caption = formString(formData, "caption");

  if (!isSupportedClipUrl(url)) {
    return { error: "Paste a YouTube, Twitch, or TikTok URL." };
  }
  if (title.length < 2) return { error: "Give the clip a title." };
  if (gameTag.length < 2) return { error: "Add a game tag." };
  if (caption.length > 400) return { error: "Caption must be under 400 characters." };

  const clip = await prisma.clip.create({
    data: {
      userId: user.id,
      url,
      title,
      gameTag,
      caption: caption || null,
    },
  });
  await syncAchievements(user.id);
  revalidatePath("/");
  revalidatePath("/clips");
  revalidatePath(`/u/${user.id}`);
  redirect(`/clips?highlight=${clip.id}`);
}

export async function deleteClipAction(formData: FormData) {
  const user = await requireOnboarded();
  const id = formString(formData, "id");
  const existing = await prisma.clip.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    throw new Error("You can only delete your own clips.");
  }
  await prisma.clip.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/clips");
  revalidatePath(`/u/${user.id}`);
}
