import Link from "next/link";
import { Badge, Card, displayNameOf } from "@/components/ui";
import { UserAvatar } from "@/components/user-avatar";
import { formatWhen, isExpired, relativeExpiry } from "@/lib/time";

type LfgCardPost = {
  id: string;
  game: string;
  platform: string;
  rank: string | null;
  rolesNeeded: string | null;
  region: string;
  voice: boolean;
  discordLink: string | null;
  expiresAt: Date;
  createdAt: Date;
  user: {
    id: string;
    displayName?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
    image?: string | null;
  };
};

export function LfgCard({ post }: { post: LfgCardPost }) {
  const expired = isExpired(post.expiresAt);
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/lfg/${post.id}`} className="text-lg font-semibold hover:text-accent">
            {post.game}
          </Link>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge>{post.platform}</Badge>
            <Badge tone="accent">{post.region}</Badge>
            {post.rank ? <Badge tone="muted">{post.rank}</Badge> : null}
            <Badge tone={post.voice ? "pink" : "muted"}>
              {post.voice ? "Voice on" : "No voice"}
            </Badge>
            <Badge tone={expired ? "warn" : "accent"}>
              {expired ? "Expired" : relativeExpiry(post.expiresAt)}
            </Badge>
          </div>
        </div>
      </div>
      {post.rolesNeeded ? (
        <p className="mt-3 text-sm text-muted">
          Roles needed: <span className="text-foreground">{post.rolesNeeded}</span>
        </p>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        <Link href={`/u/${post.user.id}`} className="flex items-center gap-2 text-sm">
          <UserAvatar user={post.user} size={28} />
          <span>{displayNameOf(post.user)}</span>
        </Link>
        <span className="text-xs text-muted">
          {formatWhen(post.createdAt)}
        </span>
      </div>
    </Card>
  );
}
