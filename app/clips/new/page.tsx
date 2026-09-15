import { ClipForm } from "@/components/forms";
import { Card, Container } from "@/components/ui";
import { requireOnboarded } from "@/lib/session";

export const metadata = { title: "Share a clip" };

export default async function NewClipPage() {
  await requireOnboarded();
  return (
    <Container className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Share a clip</h1>
        <p className="text-sm text-muted">
          No uploads — paste a public YouTube, Twitch or TikTok URL.
        </p>
      </div>
      <Card className="p-6">
        <ClipForm />
      </Card>
    </Container>
  );
}
