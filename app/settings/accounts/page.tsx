import { unlinkAccountAction } from "@/actions/moderation";
import { ClaimAccountForm } from "@/components/forms";
import { Badge, Button, Card, Container } from "@/components/ui";
import { authFlags } from "@/lib/constants";
import { platformLabel } from "@/lib/links";
import { requireOnboarded } from "@/lib/session";

export const metadata = { title: "Linked accounts" };

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ discord?: string; steam?: string }>;
}) {
  const user = await requireOnboarded();
  const flags = authFlags();
  const notices = await searchParams;
  const byPlatform = Object.fromEntries(
    user.linkedAccounts.map((item) => [item.platform, item]),
  );

  return (
    <Container className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Linked accounts</h1>
        <p className="text-sm text-muted">
          Verified badges come from Discord OAuth or Steam OpenID/API. Xbox, PSN,
          Riot and Epic are claimed until we add those logins.
        </p>
      </div>

      {notices.discord === "unconfigured" ? (
        <Card className="border-warn/40 p-4 text-sm text-warn">
          Discord client id isn&apos;t set on this server. You can still claim a tag below.
        </Card>
      ) : null}
      {notices.discord === "linked" || notices.steam === "linked" ? (
        <Card className="p-4 text-sm text-accent">Account linked.</Card>
      ) : null}

      <Card className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Discord</h2>
            <p className="text-sm text-muted">
              Auth.js Discord provider for sign-in, plus a dedicated link route
              while you&apos;re already signed in.
            </p>
          </div>
          {byPlatform.discord ? (
            <Badge tone={byPlatform.discord.verified ? "accent" : "warn"}>
              {byPlatform.discord.verified ? "Verified" : "Claimed"} ·{" "}
              {byPlatform.discord.handle}
            </Badge>
          ) : null}
        </div>
        {flags.discord ? (
          <Button href="/api/discord/link" variant="secondary">
            {byPlatform.discord ? "Re-verify Discord" : "Connect Discord"}
          </Button>
        ) : (
          <p className="rounded-xl border border-line bg-white/5 px-3 py-2 text-sm text-muted">
            Discord OAuth isn&apos;t configured (missing DISCORD_CLIENT_ID / SECRET).
            Claim a tag so people can still find you.
          </p>
        )}
        <ClaimAccountForm
          platform="discord"
          label="Claim Discord tag"
          placeholder="username"
        />
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Steam</h2>
            <p className="text-sm text-muted">
              OpenID verifies your SteamID. With STEAM_API_KEY we also pull your
              persona name. Otherwise paste a profile URL as claimed.
            </p>
          </div>
          {byPlatform.steam ? (
            <Badge tone={byPlatform.steam.verified ? "accent" : "warn"}>
              {byPlatform.steam.verified ? "Verified" : "Claimed"} ·{" "}
              {byPlatform.steam.handle}
            </Badge>
          ) : null}
        </div>
        <Button href="/api/steam" variant="secondary">
          Connect Steam via OpenID
        </Button>
        <ClaimAccountForm
          platform="steam"
          label={flags.steamKey ? "Verify Steam URL" : "Claim Steam URL"}
          placeholder="https://steamcommunity.com/id/you"
        />
      </Card>

      {(
        [
          ["xbox", "Xbox gamertag"],
          ["psn", "PSN ID"],
          ["riot", "Riot ID"],
          ["epic", "Epic display name"],
        ] as const
      ).map(([platform, placeholder]) => (
        <Card key={platform} className="space-y-3 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">{platformLabel(platform)}</h2>
              <p className="text-sm text-muted">Manual claim — marked unverified.</p>
            </div>
            {byPlatform[platform] ? (
              <Badge tone="warn">Claimed · {byPlatform[platform].handle}</Badge>
            ) : null}
          </div>
          <ClaimAccountForm
            platform={platform}
            label="Save"
            placeholder={placeholder}
          />
        </Card>
      ))}

      {user.linkedAccounts.length > 0 ? (
        <Card className="space-y-3 p-6">
          <h2 className="font-semibold">Remove a link</h2>
          {user.linkedAccounts.map((link) => (
            <form key={link.id} action={unlinkAccountAction} className="flex items-center justify-between gap-3">
              <span className="text-sm">
                {platformLabel(link.platform)} · {link.handle}
              </span>
              <input type="hidden" name="platform" value={link.platform} />
              <Button type="submit" variant="ghost">
                Unlink
              </Button>
            </form>
          ))}
        </Card>
      ) : null}
    </Container>
  );
}
