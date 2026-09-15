import { ClipCard } from "@/components/clip-card";
import { Button, Container, EmptyState } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hiddenUserIds } from "@/lib/session";

export const metadata = { title: "Clips" };

export default async function ClipsPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string; highlight?: string }>;
}) {
  const { game } = await searchParams;
  const viewer = await getSessionUser();
  const hidden = await hiddenUserIds(viewer?.id);
  const clips = await prisma.clip.findMany({
    where: {
      ...(hidden.length ? { userId: { notIn: hidden } } : {}),
      ...(game ? { gameTag: { contains: game } } : {}),
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clip discover</h1>
          <p className="text-sm text-muted">
            Newest first. Paste YouTube, Twitch or TikTok from your profile grind.
          </p>
        </div>
        <Button href="/clips/new">Share a clip</Button>
      </div>
      {clips.length === 0 ? (
        <EmptyState
          title="No clips on the reel"
          body="Share a highlight and start a Highlight Reel badge."
          action={<Button href="/clips/new">Share a clip</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {clips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} />
          ))}
        </div>
      )}
    </Container>
  );
}
