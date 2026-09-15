"use client";

import { useActionState } from "react";
import {
  completeOnboardingAction,
  oauthSignIn,
  registerAction,
  signInAction,
  type ActionState,
} from "@/actions/auth";
import { createClipAction } from "@/actions/clips";
import { createLfgAction, updateLfgAction } from "@/actions/lfg";
import { claimLinkedAccountAction, reportAction } from "@/actions/moderation";
import { updateProfileAction } from "@/actions/profile";
import { createSquadAction, updateSquadAction } from "@/actions/squads";
import { Alert, Button, Field, fieldClass } from "@/components/ui";
import {
  CURATED_GAMES,
  LFG_EXPIRY_HOURS,
  PLATFORMS,
  REGIONS,
} from "@/lib/constants";

function FormError({ state }: { state: ActionState }) {
  if (!state?.error) return null;
  return <Alert>{state.error}</Alert>;
}

export function SignInForm({
  callbackUrl,
  google,
  discord,
}: {
  callbackUrl?: string;
  google: boolean;
  discord: boolean;
}) {
  const [state, action, pending] = useActionState(signInAction, null);
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl || "/"} />
        <FormError state={state} />
        <Field label="Email">
          <input className={fieldClass} name="email" type="email" required />
        </Field>
        <Field label="Password">
          <input className={fieldClass} name="password" type="password" required />
        </Field>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      {(google || discord) && (
        <div className="space-y-2">
          <p className="text-center text-xs uppercase tracking-wider text-muted">
            or
          </p>
          {google ? (
            <form action={() => oauthSignIn("google")}>
              <Button type="submit" variant="secondary" className="w-full">
                Continue with Google
              </Button>
            </form>
          ) : null}
          {discord ? (
            <form action={() => oauthSignIn("discord")}>
              <Button type="submit" variant="secondary" className="w-full">
                Continue with Discord
              </Button>
            </form>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(registerAction, null);
  return (
    <form action={action} className="space-y-4">
      <FormError state={state} />
      <Field label="Display name">
        <input className={fieldClass} name="displayName" required minLength={2} />
      </Field>
      <Field label="Email">
        <input className={fieldClass} name="email" type="email" required />
      </Field>
      <Field label="Password" hint="At least 8 characters.">
        <input
          className={fieldClass}
          name="password"
          type="password"
          required
          minLength={8}
        />
      </Field>
      <Field label="Date of birth" hint="You need to be 13 or over.">
        <input className={fieldClass} name="dateOfBirth" type="date" required />
      </Field>
      <label className="flex items-start gap-2 text-sm text-muted">
        <input name="acceptTos" type="checkbox" className="mt-1" required />
        <span>
          I am 13 or over and I accept the{" "}
          <a className="text-accent underline" href="/tos">
            Terms
          </a>{" "}
          and{" "}
          <a className="text-accent underline" href="/age">
            age policy
          </a>
          .
        </span>
      </label>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

export function OnboardingForm() {
  const [state, action, pending] = useActionState(completeOnboardingAction, null);
  return (
    <form action={action} className="space-y-4">
      <FormError state={state} />
      <Field label="Date of birth">
        <input className={fieldClass} name="dateOfBirth" type="date" required />
      </Field>
      <label className="flex items-start gap-2 text-sm text-muted">
        <input name="acceptTos" type="checkbox" className="mt-1" required />
        <span>
          I am 13 or over and I accept the{" "}
          <a className="text-accent underline" href="/tos">
            Terms
          </a>
          .
        </span>
      </label>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}

export function ProfileForm({
  displayName,
  bio,
  avatarUrl,
  region,
  timezone,
  gameTags,
}: {
  displayName: string;
  bio: string;
  avatarUrl: string;
  region: string;
  timezone: string;
  gameTags: string[];
}) {
  const [state, action, pending] = useActionState(updateProfileAction, null);
  return (
    <form action={action} className="space-y-4">
      <FormError state={state} />
      {state?.ok ? <Alert tone="ok">Profile saved.</Alert> : null}
      <Field label="Display name">
        <input
          className={fieldClass}
          name="displayName"
          defaultValue={displayName}
          required
        />
      </Field>
      <Field label="Avatar URL" hint="Optional image URL. We'll use initials if it's empty.">
        <input className={fieldClass} name="avatarUrl" defaultValue={avatarUrl} />
      </Field>
      <Field label="Bio">
        <textarea
          className={`${fieldClass} min-h-28`}
          name="bio"
          defaultValue={bio}
          maxLength={500}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Region (optional)">
          <select className={fieldClass} name="region" defaultValue={region}>
            <option value="">Not set</option>
            {REGIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Timezone (optional)" hint="IANA name, e.g. America/New_York. Leave blank to show times in UTC.">
          <input className={fieldClass} name="timezone" defaultValue={timezone} placeholder="UTC" />
        </Field>
      </div>
      <Field
        label="Game tags"
        hint="Comma-separated. Start typing a favourite title — curated list is below."
      >
        <input
          className={fieldClass}
          name="gameTags"
          defaultValue={gameTags.join(", ")}
          list="curated-games"
          placeholder="Valorant, Helldivers 2"
        />
        <datalist id="curated-games">
          {CURATED_GAMES.map((game) => (
            <option key={game} value={game} />
          ))}
        </datalist>
      </Field>
      <p className="text-xs text-muted">
        Popular titles: {CURATED_GAMES.slice(0, 8).join(" · ")}
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export function LfgForm({
  defaults,
}: {
  defaults?: {
    id?: string;
    game: string;
    platform: string;
    rank: string;
    rolesNeeded: string;
    region: string;
    voice: boolean;
    discordLink: string;
    expiresInHours: number;
  };
}) {
  const action = defaults?.id ? updateLfgAction : createLfgAction;
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="space-y-4">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      <FormError state={state} />
      <Field label="Game">
        <input
          className={fieldClass}
          name="game"
          list="curated-games"
          defaultValue={defaults?.game}
          required
        />
        <datalist id="curated-games">
          {CURATED_GAMES.map((game) => (
            <option key={game} value={game} />
          ))}
        </datalist>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Platform">
          <select
            className={fieldClass}
            name="platform"
            defaultValue={defaults?.platform ?? "PC"}
          >
            {PLATFORMS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Region">
          <select
            className={fieldClass}
            name="region"
            defaultValue={defaults?.region ?? "Global"}
          >
            {REGIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Rank (optional)">
        <input className={fieldClass} name="rank" defaultValue={defaults?.rank} />
      </Field>
      <Field label="Roles needed" hint="e.g. IGL, support, third.">
        <input
          className={fieldClass}
          name="rolesNeeded"
          defaultValue={defaults?.rolesNeeded}
        />
      </Field>
      <Field label="Discord link" hint="Invite or vanity URL — chat stays on Discord.">
        <input
          className={fieldClass}
          name="discordLink"
          defaultValue={defaults?.discordLink}
          placeholder="https://discord.gg/..."
        />
      </Field>
      <Field label="Expires in">
        <select
          className={fieldClass}
          name="expiresInHours"
          defaultValue={String(defaults?.expiresInHours ?? 6)}
        >
          {LFG_EXPIRY_HOURS.map((hours) => (
            <option key={hours} value={hours}>
              {hours} hours
            </option>
          ))}
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="voice"
          defaultChecked={defaults?.voice ?? true}
        />
        Voice chat wanted
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : defaults?.id ? "Update LFG" : "Post LFG"}
      </Button>
    </form>
  );
}

export function ClipForm() {
  const [state, action, pending] = useActionState(createClipAction, null);
  return (
    <form action={action} className="space-y-4">
      <FormError state={state} />
      <Field label="Clip URL" hint="YouTube, Twitch or TikTok.">
        <input className={fieldClass} name="url" required placeholder="https://" />
      </Field>
      <Field label="Title">
        <input className={fieldClass} name="title" required />
      </Field>
      <Field label="Game tag">
        <input className={fieldClass} name="gameTag" list="curated-games" required />
        <datalist id="curated-games">
          {CURATED_GAMES.map((game) => (
            <option key={game} value={game} />
          ))}
        </datalist>
      </Field>
      <Field label="Caption">
        <textarea className={`${fieldClass} min-h-24`} name="caption" maxLength={400} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Sharing…" : "Share clip"}
      </Button>
    </form>
  );
}

export function SquadForm({
  defaults,
}: {
  defaults?: {
    slug?: string;
    name: string;
    bio: string;
    games: string;
    discordLink: string;
  };
}) {
  const action = defaults?.slug ? updateSquadAction : createSquadAction;
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="space-y-4">
      {defaults?.slug ? (
        <input type="hidden" name="slug" value={defaults.slug} />
      ) : null}
      <FormError state={state} />
      {state?.ok ? <Alert tone="ok">Squad updated.</Alert> : null}
      <Field label="Squad name">
        <input className={fieldClass} name="name" defaultValue={defaults?.name} required />
      </Field>
      <Field label="Bio">
        <textarea
          className={`${fieldClass} min-h-24`}
          name="bio"
          defaultValue={defaults?.bio}
        />
      </Field>
      <Field label="Games" hint="Comma-separated.">
        <input
          className={fieldClass}
          name="games"
          defaultValue={defaults?.games}
          list="curated-games"
        />
        <datalist id="curated-games">
          {CURATED_GAMES.map((game) => (
            <option key={game} value={game} />
          ))}
        </datalist>
      </Field>
      <Field label="Discord link">
        <input
          className={fieldClass}
          name="discordLink"
          defaultValue={defaults?.discordLink}
        />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : defaults?.slug ? "Save squad" : "Create squad"}
      </Button>
    </form>
  );
}

export function ClaimAccountForm({
  platform,
  label,
  placeholder,
}: {
  platform: string;
  label: string;
  placeholder: string;
}) {
  const [state, action, pending] = useActionState(claimLinkedAccountAction, null);
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="platform" value={platform} />
      <input className={fieldClass} name="handle" placeholder={placeholder} required />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : label}
      </Button>
      {state?.error ? (
        <p className="text-sm text-danger sm:self-center">{state.error}</p>
      ) : null}
    </form>
  );
}

export function ReportForm({
  targetType,
  targetId,
  reportedId,
}: {
  targetType: string;
  targetId: string;
  reportedId?: string;
}) {
  const [state, action, pending] = useActionState(reportAction, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      {reportedId ? <input type="hidden" name="reportedId" value={reportedId} /> : null}
      <FormError state={state} />
      {state?.ok ? <Alert tone="ok">Thanks — we&apos;ve logged the report.</Alert> : null}
      <Field label="Reason">
        <select className={fieldClass} name="reason" required>
          <option value="spam">Spam or scams</option>
          <option value="harassment">Harassment</option>
          <option value="nsfw">NSFW / underage</option>
          <option value="impersonation">Impersonation</option>
          <option value="other">Something else</option>
        </select>
      </Field>
      <Field label="Details">
        <textarea className={`${fieldClass} min-h-20`} name="details" />
      </Field>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Sending…" : "Submit report"}
      </Button>
    </form>
  );
}
