import Link from "next/link";
import { ProfileForm } from "@/components/forms";
import { Card, Container } from "@/components/ui";
import { requireOnboarded } from "@/lib/session";

export const metadata = { title: "Edit profile" };

export default async function SettingsPage() {
  const user = await requireOnboarded();
  return (
    <Container className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit profile</h1>
        <p className="text-sm text-muted">
          Default region is Oceania. Times across the app use Australia/Melbourne
          unless you change your timezone.
        </p>
        <div className="mt-3 flex gap-4 text-sm">
          <Link href="/settings/accounts" className="text-accent hover:underline">
            Linked accounts
          </Link>
          <Link href="/settings/safety" className="text-accent hover:underline">
            Safety
          </Link>
          <Link href={`/u/${user.id}`} className="text-accent hover:underline">
            View public profile
          </Link>
        </div>
      </div>
      <Card className="p-6">
        <ProfileForm
          displayName={user.displayName || user.name || ""}
          bio={user.bio || ""}
          avatarUrl={user.avatarUrl || user.image || ""}
          region={user.region}
          timezone={user.timezone}
          gameTags={user.gameTags.map((tag) => tag.name)}
        />
      </Card>
    </Container>
  );
}
