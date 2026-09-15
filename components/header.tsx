import Link from "next/link";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui";
import { UserAvatar } from "@/components/user-avatar";
import { getCurrentProfile } from "@/lib/session";

const links = [
  { href: "/lfg", label: "LFG" },
  { href: "/clips", label: "Clips" },
  { href: "/squads", label: "Squads" },
];

export async function Header() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-[#07090d]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-black text-black">
              SS
            </span>
            <span className="tracking-tight">
              Squad<span className="text-accent">Stack</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <Button href="/lfg/new" variant="primary" className="hidden sm:inline-flex">
                Post LFG
              </Button>
              <Link
                href={`/u/${profile.id}`}
                className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-white/5"
              >
                <UserAvatar user={profile} size={32} />
                <span className="hidden max-w-[8rem] truncate text-sm sm:block">
                  {profile.displayName || "You"}
                </span>
              </Link>
              <Link
                href="/settings"
                className="rounded-lg px-2 py-2 text-sm text-muted hover:text-foreground"
              >
                Settings
              </Link>
              <form action={signOutAction}>
                <Button variant="ghost" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button href="/signin" variant="ghost">
                Sign in
              </Button>
              <Button href="/signup" variant="primary">
                Join SquadStack
              </Button>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-1 border-t border-line/70 px-3 py-2 sm:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex-1 rounded-lg px-2 py-1.5 text-center text-sm text-muted hover:bg-white/5"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
