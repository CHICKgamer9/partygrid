import Link from "next/link";
import { Container } from "@/components/ui";

export function Footer() {
  return (
    <footer className="page-wrap mt-auto border-t border-line/80 py-8 text-sm text-muted">
      <Container className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>PartyGrid — find a party, show your skill. Discord stays the chat.</p>
        <div className="flex gap-4">
          <Link href="/tos" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/age" className="hover:text-foreground">
            Age policy
          </Link>
        </div>
      </Container>
    </footer>
  );
}
