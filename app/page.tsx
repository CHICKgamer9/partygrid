import Link from "next/link";
import { ClipCard } from "@/components/clip-card";
import { LfgCard } from "@/components/lfg-card";
import { Button, Container, EmptyState } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hiddenUserIds } from "@/lib/session";

export default async function HomePage() {
  const viewer = await getSessionUser();
  const hidden = await hiddenUserIds(viewer?.id);
  const hide = hidden.length ? { userId: { notIn: hidden } } : {};

  const [lfg, clips] = await Promise.all([
    prisma.lfgPost.findMany({
      where: { expiresAt: { gt: new Date() }, ...hide },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.clip.findMany({
      where: hide,
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <Container className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-line bg-card px-6 py-10 sm:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Global LFG · clips · squads
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
          Find your squad. Prove you play.
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Gamer profiles, looking-for-group posts, clip shares and squads.
          Discord stays the chat — SquadStack keeps the party together.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/lfg">Browse LFG</Button>
          <Button href="/signup" variant="secondary">
            Join SquadStack
          </Button>
          <Button href="/clips" variant="ghost">
            Watch clips
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Active LFG</h2>
            <p className="text-sm text-muted">Live posts, newest first. Expired stay off the home feed.</p>
          </div>
          <Link href="/lfg" className="text-sm text-accent hover:underline">
            All listings
          </Link>
        </div>
        {lfg.length === 0 ? (
          <EmptyState
            title="No live parties yet"
            body="Be the first to post an LFG."
            action={<Button href="/lfg/new">Post LFG</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lfg.map((post) => (
              <LfgCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Fresh clips</h2>
            <p className="text-sm text-muted">Newest highlights from the stack.</p>
          </div>
          <Link href="/clips" className="text-sm text-accent hover:underline">
            Discover
          </Link>
        </div>
        {clips.length === 0 ? (
          <EmptyState
            title="No clips yet"
            body="Paste a YouTube, Twitch or TikTok URL to start the reel."
            action={<Button href="/clips/new">Share a clip</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {clips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
