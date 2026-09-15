import { publicAppUrl } from "@/lib/constants";

const STEAM_OPENID = "https://steamcommunity.com/openid/login";

export function steamOpenIdRedirect(returnTo: string) {
  const realm = publicAppUrl();
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${STEAM_OPENID}?${params.toString()}`;
}

export function extractSteamId(claimedId: string | null) {
  if (!claimedId) return null;
  const match = claimedId.match(
    /https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)/,
  );
  return match?.[1] ?? null;
}

export async function verifySteamOpenId(searchParams: URLSearchParams) {
  const payload = new URLSearchParams(searchParams);
  payload.set("openid.mode", "check_authentication");
  const response = await fetch(STEAM_OPENID, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });
  const text = await response.text();
  return text.includes("is_valid:true");
}

export type SteamSummary = {
  steamId: string;
  personaName: string;
  profileUrl: string;
  avatarUrl?: string;
};

export async function fetchSteamSummary(
  steamId: string,
): Promise<SteamSummary | null> {
  const key = process.env.STEAM_API_KEY;
  if (!key) {
    return {
      steamId,
      personaName: steamId,
      profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
    };
  }
  const url = new URL("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/");
  url.searchParams.set("key", key);
  url.searchParams.set("steamids", steamId);
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as {
    response?: {
      players?: {
        steamid: string;
        personaname: string;
        profileurl: string;
        avatarfull?: string;
      }[];
    };
  };
  const player = data.response?.players?.[0];
  if (!player) return null;
  return {
    steamId: player.steamid,
    personaName: player.personaname,
    profileUrl: player.profileurl,
    avatarUrl: player.avatarfull,
  };
}

export function parseSteamProfileUrl(raw: string) {
  try {
    const url = new URL(raw.trim());
    if (!url.hostname.includes("steamcommunity.com")) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "profiles" && /^\d+$/.test(parts[1] ?? "")) {
      return { kind: "id" as const, value: parts[1] };
    }
    if (parts[0] === "id" && parts[1]) {
      return { kind: "vanity" as const, value: parts[1] };
    }
    return null;
  } catch {
    return null;
  }
}

export async function resolveSteamClaim(raw: string): Promise<SteamSummary | null> {
  const parsed = parseSteamProfileUrl(raw);
  if (!parsed) return null;
  const key = process.env.STEAM_API_KEY;

  if (parsed.kind === "id") {
    return fetchSteamSummary(parsed.value);
  }

  if (!key) {
    return {
      steamId: parsed.value,
      personaName: parsed.value,
      profileUrl: `https://steamcommunity.com/id/${parsed.value}`,
    };
  }

  const url = new URL(
    "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/",
  );
  url.searchParams.set("key", key);
  url.searchParams.set("vanityurl", parsed.value);
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as {
    response?: { success?: number; steamid?: string };
  };
  if (data.response?.success !== 1 || !data.response.steamid) return null;
  return fetchSteamSummary(data.response.steamid);
}
