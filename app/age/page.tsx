import { Card, Container } from "@/components/ui";
import { MIN_AGE } from "@/lib/constants";

export const metadata = { title: "Age policy" };

export default function AgePage() {
  return (
    <Container className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Age policy</h1>
      <Card className="space-y-4 p-6 text-sm leading-7 text-muted">
        <p>
          PartyGrid is for people aged <strong className="text-foreground">{MIN_AGE} or over</strong>.
          Email signup asks for a date of birth. Google or Discord sign-in asks
          for the same check on first visit.
        </p>
        <p>
          We do not use date of birth for recommendations or ads. If we learn
          someone is under {MIN_AGE}, the account is removed.
        </p>
        <p>
          Parents or carers in Australia can email the operator if a minor has
          signed up. Use the report tool on a profile if you spot underage use.
        </p>
      </Card>
    </Container>
  );
}
