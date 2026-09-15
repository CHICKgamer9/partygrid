import Link from "next/link";
import { Button, Card, Container, EmptyState } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Squads" };

export default async function SquadsPage() {
  const squads = await prisma.squad.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Squads</h1>
          <p className="text-sm text-muted">
            Create or join a crew. Chat lives on the Discord link.
          </p>
        </div>
        <Button href="/squads/new">Create squad</Button>
      </div>
      {squads.length === 0 ? (
        <EmptyState
          title="No squads yet"
          body="Spin one up for the next session."
          action={<Button href="/squads/new">Create squad</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {squads.map((squad) => (
            <Card key={squad.id} className="p-5">
              <Link href={`/squads/${squad.slug}`} className="text-xl font-semibold hover:text-accent">
                {squad.name}
              </Link>
              <p className="mt-2 text-sm text-muted">{squad.bio || "No bio yet."}</p>
              <p className="mt-3 text-xs text-muted">
                {squad.games || "Any game"} · {squad._count.members}{" "}
                {squad._count.members === 1 ? "member" : "members"}
              </p>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
