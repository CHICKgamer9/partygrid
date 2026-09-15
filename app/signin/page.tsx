import Link from "next/link";
import { SignInForm } from "@/components/forms";
import { Card, Container } from "@/components/ui";
import { authFlags } from "@/lib/constants";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const flags = authFlags();
  return (
    <Container className="max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">
          Welcome back. Session is required to post LFG, clips and squads.
        </p>
        <div className="mt-6">
          <SignInForm
            callbackUrl={callbackUrl}
            google={flags.google}
            discord={flags.discord}
          />
        </div>
        <p className="mt-6 text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </Container>
  );
}
