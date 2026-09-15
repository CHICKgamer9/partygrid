import Link from "next/link";
import { unblockUserAction } from "@/actions/moderation";
import { Button, Card, Container, displayNameOf } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/session";

export const metadata = { title: "Safety" };

export default async function SafetyPage() {
  const user = await requireOnboarded();
  const blocks = await prisma.block.findMany({
    where: { blockerId: user.id },
    include: { blocked: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Safety</h1>
        <p className="text-sm text-muted">
          Blocked players disappear from your home feed, LFG board and clip
          discover. Reports are stored for operators.
        </p>
      </div>
      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Blocked users</h2>
        {blocks.length === 0 ? (
          <p className="text-sm text-muted">You haven&apos;t blocked anyone.</p>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className="flex items-center justify-between gap-3">
              <Link href={`/u/${block.blocked.id}`} className="hover:text-accent">
                {displayNameOf(block.blocked)}
              </Link>
              <form action={unblockUserAction}>
                <input type="hidden" name="blockedId" value={block.blockedId} />
                <Button type="submit" variant="secondary">
                  Unblock
                </Button>
              </form>
            </div>
          ))
        )}
      </Card>
    </Container>
  );
}
