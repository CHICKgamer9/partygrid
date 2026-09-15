import { Card, Container } from "@/components/ui";

export const metadata = { title: "Terms" };

export default function TosPage() {
  return (
    <Container className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Terms of use</h1>
      <Card className="space-y-4 p-6 text-sm leading-7 text-muted">
        <p>
          SquadStack helps you find a squad and show how you play. Discord
          remains the chat. Don&apos;t be a grub.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>You must be 13 or over. We collect date of birth only for the age gate.</li>
          <li>No harassment, hate, scams, or sharing other people&apos;s private info.</li>
          <li>Linked accounts you claim must be yours. Verified badges mean we checked via OAuth or Steam OpenID/API.</li>
          <li>LFG Discord invites should be ones you&apos;re happy to share in public.</li>
          <li>We may remove posts, clips or squads that break these terms.</li>
          <li>Report and block tools are how you keep your stack tidy. Reports are reviewed by operators, not an automated jail.</li>
          <li>No payments, DMs or in-app voice in v1 — take it to Discord.</li>
        </ul>
        <p>Not affiliated with the platforms you link.</p>
      </Card>
    </Container>
  );
}
