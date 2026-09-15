import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/forms";
import { Card, Container } from "@/components/ui";
import { requireProfile } from "@/lib/session";

export const metadata = { title: "Age gate" };

export default async function OnboardingPage() {
  const profile = await requireProfile();
  if (profile.dateOfBirth && profile.tosAcceptedAt) {
    redirect("/");
  }
  return (
    <Container className="max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">One more step</h1>
        <p className="mt-2 text-sm text-muted">
          OAuth gets you in, but PartyGrid is 13+. Confirm your date of birth
          and the Terms before you post.
        </p>
        <div className="mt-6">
          <OnboardingForm />
        </div>
      </Card>
    </Container>
  );
}
