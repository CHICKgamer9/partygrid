import { Button, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-16 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">That page doesn&apos;t exist.</p>
      <div className="mt-6">
        <Button href="/">Back home</Button>
      </div>
    </Container>
  );
}
