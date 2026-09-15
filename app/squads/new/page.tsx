import { SquadForm } from "@/components/forms";
import { Card, Container } from "@/components/ui";
import { requireOnboarded } from "@/lib/session";

export const metadata = { title: "Create squad" };

export default async function NewSquadPage() {
  await requireOnboarded();
  return (
    <Container className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create a squad</h1>
        <p className="text-sm text-muted">You&apos;ll be the first member. Share the page to invite others.</p>
      </div>
      <Card className="p-6">
        <SquadForm />
      </Card>
    </Container>
  );
}
