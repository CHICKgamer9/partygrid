import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user?.id) redirect("/signin");
  return user;
}

export async function getCurrentProfile() {
  const sessionUser = await getSessionUser();
  if (!sessionUser?.id) return null;
  return prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      gameTags: { orderBy: { name: "asc" } },
      linkedAccounts: { orderBy: { platform: "asc" } },
      achievements: { orderBy: { unlockedAt: "asc" } },
    },
  });
}

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/signin");
  return profile;
}

export async function requireOnboarded() {
  const profile = await requireProfile();
  if (!profile.dateOfBirth || !profile.tosAcceptedAt) {
    redirect("/onboarding");
  }
  return profile;
}

export async function hiddenUserIds(viewerId?: string | null) {
  if (!viewerId) return [] as string[];
  const rows = await prisma.block.findMany({
    where: {
      OR: [{ blockerId: viewerId }, { blockedId: viewerId }],
    },
    select: { blockerId: true, blockedId: true },
  });
  const ids = new Set<string>();
  for (const row of rows) {
    if (row.blockerId !== viewerId) ids.add(row.blockerId);
    if (row.blockedId !== viewerId) ids.add(row.blockedId);
  }
  return [...ids];
}
