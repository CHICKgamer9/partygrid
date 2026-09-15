import { notFound } from "next/navigation";
import { deleteClipAction } from "@/actions/clips";
import { blockUserAction } from "@/actions/moderation";
import { BadgeRow } from "@/components/badge-row";
import { ClipCard } from "@/components/clip-card";
import { ReportForm } from "@/components/forms";
import { LfgCard } from "@/components/lfg-card";
import { Badge, Button, Card, Container, displayNameOf } from "@/components/ui";
import { UserAvatar } from "@/components/user-avatar";
import { platformLabel } from "@/lib/links";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  return { title: user ? displayNameOf(user) : "Profile" };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      gameTags: { orderBy: { name: "asc" } },
      linkedAccounts: { orderBy: { platform: "asc" } },
      achievements: { orderBy: { unlockedAt: "asc" } },
      clips: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 12 },
      lfgPosts: {
        include: { user: true },
        where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      },
      squadMemberships: { include: { squad: true } },
    },
  });
  if (!user) notFound();

  const viewer = await getSessionUser();
  const mine = viewer?.id === user.id;
  const blocked =
    viewer &&
    (await prisma.block.findUnique({
      where: {
        blockerId_blockedId: { blockerId: viewer.id, blockedId: user.id },
      },
    }));

  return (
    <Container className="space-y-8">
      <Card className="p-6">
        <div className="flex flex-wrap items-start gap-5">
          <UserAvatar user={user} size={80} />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold">{displayNameOf(user)}</h1>
            <p className="mt-1 text-sm text-muted">
              {[user.region, user.timezone].filter(Boolean).join(" · ") ||
                "Region and timezone not set"}
            </p>
            <p className="mt-3 max-w-2xl text-sm">{user.bio || "No bio yet."}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {user.gameTags.map((tag) => (
                <Badge key={tag.id} tone="accent">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          {mine ? <Button href="/settings">Edit profile</Button> : null}
        </div>
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Badges
          </h2>
          <BadgeRow unlocked={user.achievements} />
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Linked accounts</h2>
        <div className="flex flex-wrap gap-2">
          {user.linkedAccounts.length === 0 ? (
            <p className="text-sm text-muted">No accounts linked yet.</p>
          ) : (
            user.linkedAccounts.map((link) => (
              <Badge key={link.id} tone={link.verified ? "accent" : "warn"}>
                {platformLabel(link.platform)} · {link.handle} ·{" "}
                {link.verified ? "Verified" : "Claimed"}
              </Badge>
            ))
          )}
        </div>
      </section>

      {user.squadMemberships.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Squads</h2>
          <div className="flex flex-wrap gap-2">
            {user.squadMemberships.map((membership) => (
              <Button
                key={membership.id}
                href={`/squads/${membership.squad.slug}`}
                variant="secondary"
              >
                {membership.squad.name}
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Active LFG</h2>
        {user.lfgPosts.length === 0 ? (
          <p className="text-sm text-muted">No live LFG.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {user.lfgPosts.map((post) => (
              <LfgCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Clips</h2>
        {user.clips.length === 0 ? (
          <p className="text-sm text-muted">No clips yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {user.clips.map((clip) => (
              <div key={clip.id} className="space-y-2">
                <ClipCard clip={clip} />
                {mine ? (
                  <form action={deleteClipAction}>
                    <input type="hidden" name="id" value={clip.id} />
                    <Button type="submit" variant="ghost">
                      Delete clip
                    </Button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {!mine && viewer ? (
        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Safety</h2>
          {blocked ? (
            <p className="text-sm text-muted">You&apos;ve blocked this player.</p>
          ) : (
            <form action={blockUserAction}>
              <input type="hidden" name="blockedId" value={user.id} />
              <Button type="submit" variant="danger">
                Block user
              </Button>
            </form>
          )}
          <ReportForm
            targetType="user"
            targetId={user.id}
            reportedId={user.id}
          />
        </Card>
      ) : null}
    </Container>
  );
}
