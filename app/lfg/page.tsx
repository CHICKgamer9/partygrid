import { LfgCard } from "@/components/lfg-card";
import { Button, Card, Container, EmptyState, fieldClass } from "@/components/ui";
import { PLATFORMS, REGIONS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hiddenUserIds } from "@/lib/session";

export const metadata = { title: "LFG board" };

export default async function LfgBoardPage({
  searchParams,
}: {
  searchParams: Promise<{
    game?: string;
    platform?: string;
    region?: string;
    active?: string;
  }>;
}) {
  const filters = await searchParams;
  const activeOnly = filters.active !== "0";
  const viewer = await getSessionUser();
  const hidden = await hiddenUserIds(viewer?.id);

  const posts = await prisma.lfgPost.findMany({
    where: {
      ...(hidden.length ? { userId: { notIn: hidden } } : {}),
      ...(filters.game
        ? { game: { contains: filters.game } }
        : {}),
      ...(filters.platform ? { platform: filters.platform } : {}),
      ...(filters.region ? { region: filters.region } : {}),
      ...(activeOnly ? { expiresAt: { gt: new Date() } } : {}),
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Looking for a party</h1>
          <p className="text-sm text-muted">
            Filter the board. Expired posts stay hidden unless you tick them back on.
          </p>
        </div>
        <Button href="/lfg/new">Post LFG</Button>
      </div>

      <Card className="p-4">
        <form className="grid gap-3 md:grid-cols-5" method="get">
          <input
            className={fieldClass}
            name="game"
            placeholder="Game"
            defaultValue={filters.game}
          />
          <select className={fieldClass} name="platform" defaultValue={filters.platform ?? ""}>
            <option value="">All platforms</option>
            {PLATFORMS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select className={fieldClass} name="region" defaultValue={filters.region ?? ""}>
            <option value="">All regions</option>
            {REGIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" value="0" defaultChecked={!activeOnly} />
            Include expired
          </label>
          <Button type="submit" variant="secondary">
            Apply filters
          </Button>
        </form>
      </Card>

      {posts.length === 0 ? (
        <EmptyState
          title="Nothing matches"
          body="Try clearing filters or post the party you want to see."
          action={<Button href="/lfg/new">Post LFG</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <LfgCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </Container>
  );
}
