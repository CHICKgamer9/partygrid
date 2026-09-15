export const APP_NAME = "PartyGrid";
export const APP_TZ = "Australia/Melbourne";
export const DEFAULT_REGION = "Oceania";
export const MIN_AGE = 13;

export const REGIONS = [
  "Oceania",
  "North America",
  "Europe",
  "Asia",
  "South America",
  "Africa",
  "Middle East",
] as const;

export const PLATFORMS = [
  "PC",
  "Xbox",
  "PlayStation",
  "Switch",
  "Mobile",
] as const;

export const LINK_PLATFORMS = [
  "discord",
  "steam",
  "xbox",
  "psn",
  "riot",
  "epic",
] as const;

export const MANUAL_PLATFORMS = ["xbox", "psn", "riot", "epic"] as const;

export const LFG_EXPIRY_HOURS = [2, 4, 6, 8, 12, 18, 24] as const;

export const CURATED_GAMES = [
  "League of Legends",
  "Valorant",
  "Counter-Strike 2",
  "Fortnite",
  "Minecraft",
  "Apex Legends",
  "Overwatch 2",
  "Rocket League",
  "Call of Duty",
  "Rainbow Six Siege",
  "Destiny 2",
  "Grand Theft Auto V",
  "Helldivers 2",
  "Marvel Rivals",
  "The Finals",
  "World of Warcraft",
  "Final Fantasy XIV",
  "Elden Ring",
  "Super Smash Bros. Ultimate",
  "Mario Kart 8 Deluxe",
  "Lethal Company",
  "Rust",
  "Dead by Daylight",
  "Teamfight Tactics",
] as const;

export type Region = (typeof REGIONS)[number];
export type Platform = (typeof PLATFORMS)[number];
export type LinkPlatform = (typeof LINK_PLATFORMS)[number];

export function authFlags() {
  return {
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
    discord: Boolean(
      process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET,
    ),
    steamKey: Boolean(process.env.STEAM_API_KEY),
  };
}

export function publicAppUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.STEAM_REALM ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
