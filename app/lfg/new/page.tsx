import { LfgForm } from "@/components/forms";
import { Card, Container } from "@/components/ui";
import { requireOnboarded } from "@/lib/session";

export const metadata = { title: "Post LFG" };

export default async function NewLfgPage() {
  await requireOnboarded();
  return (
    <Container className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Post LFG</h1>
        <p className="text-sm text-muted">
          2–24 hour expiry. Drop a Discord link so the party can jump in.
        </p>
      </div>
      <Card className="p-6">
        <LfgForm />
      </Card>
    </Container>
  );
}
