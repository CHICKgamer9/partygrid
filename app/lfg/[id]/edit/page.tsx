import { notFound, redirect } from "next/navigation";
import { LfgForm } from "@/components/forms";
import { Card, Container } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/session";
import { clockMs } from "@/lib/time";

export const metadata = { title: "Edit LFG" };

export default async function EditLfgPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireOnboarded();
  const { id } = await params;
  const post = await prisma.lfgPost.findUnique({ where: { id } });
  if (!post) notFound();
  if (post.userId !== user.id) redirect(`/lfg/${id}`);

  const remaining = Math.max(
    2,
    Math.min(24, Math.round((post.expiresAt.getTime() - clockMs()) / 3600000)),
  );
  const snapped = [2, 4, 6, 8, 12, 18, 24].reduce((best, hours) =>
    Math.abs(hours - remaining) < Math.abs(best - remaining) ? hours : best,
  );

  return (
    <Container className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Edit LFG</h1>
      <Card className="p-6">
        <LfgForm
          defaults={{
            id: post.id,
            game: post.game,
            platform: post.platform,
            rank: post.rank ?? "",
            rolesNeeded: post.rolesNeeded ?? "",
            region: post.region,
            voice: post.voice,
            discordLink: post.discordLink ?? "",
            expiresInHours: snapped,
          }}
        />
      </Card>
    </Container>
  );
}
