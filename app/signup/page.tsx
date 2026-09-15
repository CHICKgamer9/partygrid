import Link from "next/link";
import { oauthSignIn } from "@/actions/auth";
import { SignUpForm } from "@/components/forms";
import { Button, Card, Container } from "@/components/ui";
import { authFlags } from "@/lib/constants";

export const metadata = { title: "Join SquadStack" };

export default function SignUpPage() {
  const flags = authFlags();
  const google = oauthSignIn.bind(null, "google");
  const discord = oauthSignIn.bind(null, "discord");
  return (
    <Container className="max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">Join SquadStack</h1>
        <p className="mt-1 text-sm text-muted">
          Email signup with a 13+ age gate. Region and timezone are optional.
        </p>
        <div className="mt-6">
          <SignUpForm />
        </div>
        {(flags.google || flags.discord) && (
          <div className="mt-6 space-y-2">
            <p className="mb-3 text-center text-xs uppercase tracking-wider text-muted">
              or sign up with
            </p>
            {flags.google ? (
              <form action={google}>
                <Button type="submit" variant="secondary" className="w-full">
                  Continue with Google
                </Button>
              </form>
            ) : null}
            {flags.discord ? (
              <form action={discord}>
                <Button type="submit" variant="secondary" className="w-full">
                  Continue with Discord
                </Button>
              </form>
            ) : null}
          </div>
        )}
        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/signin" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </Container>
  );
}
