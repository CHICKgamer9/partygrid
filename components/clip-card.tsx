import Link from "next/link";
import { Badge, Card, displayNameOf } from "@/components/ui";
import { UserAvatar } from "@/components/user-avatar";
import { parseClipUrl } from "@/lib/clips";
import { formatWhen } from "@/lib/time";
import { ClipEmbed } from "@/components/clip-embed";

type ClipItem = {
  id: string;
  url: string;
  title: string;
  gameTag: string;
  caption: string | null;
  createdAt: Date;
  user: {
    id: string;
    displayName?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
    image?: string | null;
  };
};

export function ClipCard({ clip }: { clip: ClipItem }) {
  const parsed = parseClipUrl(clip.url);
  return (
    <Card className="overflow-hidden">
      <ClipEmbed url={clip.url} title={clip.title} />
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">{clip.title}</h3>
          <Badge tone="accent">{clip.gameTag}</Badge>
        </div>
        {clip.caption ? (
          <p className="text-sm text-muted">{clip.caption}</p>
        ) : null}
        <div className="flex items-center justify-between gap-3 pt-1">
          <Link href={`/u/${clip.user.id}`} className="flex items-center gap-2 text-sm">
            <UserAvatar user={clip.user} size={28} />
            <span>{displayNameOf(clip.user)}</span>
          </Link>
          <a
            href={parsed?.watchUrl ?? clip.url}
            className="text-xs text-muted hover:text-accent"
            target="_blank"
            rel="noreferrer"
          >
            Open · {formatWhen(clip.createdAt)}
          </a>
        </div>
      </div>
    </Card>
  );
}
