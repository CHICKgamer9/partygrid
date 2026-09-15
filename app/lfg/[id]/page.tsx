import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteLfgAction } from "@/actions/lfg";
import { ReportForm } from "@/components/forms";
import { Badge, Button, Card, Container, displayNameOf } from "@/components/ui";
import { UserAvatar } from "@/components/user-avatar";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatWhen, isExpired, relativeExpiry } from "@/lib/time";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.lfgPost.findUnique({ where: { id } });
  return { title: post ? `${post.game} LFG` : "LFG" };
}

export default async function LfgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.lfgPost.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!post) notFound();
  const viewer = await getSessionUser();
  const mine = viewer?.id === post.userId;
  const expired = isExpired(post.expiresAt);

  return (
    <Container className="max-w-3xl space-y-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">LFG</p>
            <h1 className="mt-1 text-3xl font-bold">{post.game}</h1>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge>{post.platform}</Badge>
              <Badge tone="accent">{post.region}</Badge>
              {post.rank ? <Badge tone="muted">{post.rank}</Badge> : null}
              <Badge tone={post.voice ? "pink" : "muted"}>
                {post.voice ? "Voice on" : "No voice"}
              </Badge>
              <Badge tone={expired ? "warn" : "accent"}>
                {expired ? "Expired" : relativeExpiry(post.expiresAt)}
              </Badge>
            </div>
          </div>
          {mine ? (
            <div className="flex gap-2">
              <Button href={`/lfg/${post.id}/edit`} variant="secondary">
                Edit
              </Button>
              <form action={deleteLfgAction}>
                <input type="hidden" name="id" value={post.id} />
                <Button type="submit" variant="danger">
                  Delete
                </Button>
              </form>
            </div>
          ) : null}
        </div>
        {post.rolesNeeded ? (
          <p className="mt-5 text-sm">
            <span className="text-muted">Roles needed: </span>
            {post.rolesNeeded}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-muted">
          Expires {formatWhen(post.expiresAt)} · posted{" "}
          {formatWhen(post.createdAt)}
        </p>
        {post.discordLink ? (
          <div className="mt-5">
            <Button href={post.discordLink}>Jump into Discord</Button>
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted">
            No Discord link on this post — ping the poster from their profile tags.
          </p>
        )}
        <Link
          href={`/u/${post.user.id}`}
          className="mt-6 flex items-center gap-3 border-t border-line pt-5"
        >
          <UserAvatar user={post.user} size={40} />
          <div>
            <p className="font-semibold">{displayNameOf(post.user)}</p>
            <p className="text-xs text-muted">{post.user.region}</p>
          </div>
        </Link>
      </Card>
      {!mine && viewer ? (
        <Card className="p-6">
          <h2 className="font-semibold">Report this listing</h2>
          <div className="mt-3">
            <ReportForm
              targetType="lfg"
              targetId={post.id}
              reportedId={post.userId}
            />
          </div>
        </Card>
      ) : null}
    </Container>
  );
}
