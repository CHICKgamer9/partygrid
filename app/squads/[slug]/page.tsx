import Link from "next/link";
import { notFound } from "next/navigation";
import { joinSquadAction, leaveSquadAction } from "@/actions/squads";
import { ClipCard } from "@/components/clip-card";
import { SquadForm } from "@/components/forms";
import { LfgCard } from "@/components/lfg-card";
import { Badge, Button, Card, Container, displayNameOf } from "@/components/ui";
import { UserAvatar } from "@/components/user-avatar";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const squad = await prisma.squad.findUnique({ where: { slug } });
  return { title: squad?.name ?? "Squad" };
}

export default async function SquadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const squad = await prisma.squad.findUnique({
    where: { slug },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: "asc" } },
    },
  });
  if (!squad) notFound();

  const memberIds = squad.members.map((member) => member.userId);
  const [clips, lfg] = await Promise.all([
    prisma.clip.findMany({
      where: { userId: { in: memberIds } },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.lfgPost.findMany({
      where: { userId: { in: memberIds }, expiresAt: { gt: new Date() } },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const viewer = await getSessionUser();
  const isMember = Boolean(viewer && memberIds.includes(viewer.id));
  const isCreator = viewer?.id === squad.creatorId;
  const games = squad.games
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <Container className="space-y-8">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Squad</p>
            <h1 className="mt-1 text-3xl font-bold">{squad.name}</h1>
            <p className="mt-2 max-w-2xl text-muted">{squad.bio || "No bio yet."}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {games.map((game) => (
                <Badge key={game}>{game}</Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {squad.discordLink ? (
              <Button href={squad.discordLink}>Discord</Button>
            ) : null}
            {viewer && !isMember ? (
              <form action={joinSquadAction}>
                <input type="hidden" name="slug" value={squad.slug} />
                <Button type="submit">Join squad</Button>
              </form>
            ) : null}
            {isMember ? (
              <form action={leaveSquadAction}>
                <input type="hidden" name="slug" value={squad.slug} />
                <Button type="submit" variant="secondary">
                  Leave
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Members</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {squad.members.map((member) => (
            <Link key={member.id} href={`/u/${member.user.id}`}>
              <Card className="flex items-center gap-3 p-3">
                <UserAvatar user={member.user} size={36} />
                <div>
                  <p className="font-medium">{displayNameOf(member.user)}</p>
                  <p className="text-xs text-muted">
                    {member.userId === squad.creatorId ? "Creator" : "Member"}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Squad feed</h2>
        <p className="text-sm text-muted">Recent clips and live LFG from members.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {lfg.map((post) => (
            <LfgCard key={post.id} post={post} />
          ))}
          {clips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} />
          ))}
        </div>
        {lfg.length === 0 && clips.length === 0 ? (
          <p className="text-sm text-muted">Nothing on the feed yet.</p>
        ) : null}
      </section>

      {isCreator ? (
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Edit squad</h2>
          <SquadForm
            defaults={{
              slug: squad.slug,
              name: squad.name,
              bio: squad.bio ?? "",
              games: squad.games,
              discordLink: squad.discordLink ?? "",
            }}
          />
        </Card>
      ) : null}
    </Container>
  );
}
