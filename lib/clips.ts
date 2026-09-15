export type ClipProvider = "youtube" | "twitch" | "tiktok" | "other";

export type ParsedClip = {
  provider: ClipProvider;
  embedUrl: string | null;
  watchUrl: string;
  kind: "video" | "clip" | "unknown";
};

function youtubeId(url: URL) {
  if (url.hostname.includes("youtu.be")) {
    return url.pathname.replace("/", "").split("/")[0] || null;
  }
  if (url.hostname.includes("youtube.com")) {
    if (url.pathname.startsWith("/watch")) return url.searchParams.get("v");
    if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/")[2] || null;
    }
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/")[2] || null;
    }
  }
  return null;
}

function twitchParent() {
  try {
    return new URL(
      process.env.AUTH_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000",
    ).hostname;
  } catch {
    return "localhost";
  }
}

export function parseClipUrl(raw: string): ParsedClip | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(url.protocol)) return null;

  const yt = youtubeId(url);
  if (yt) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt}`,
      watchUrl: `https://www.youtube.com/watch?v=${yt}`,
      kind: "video",
    };
  }

  const parent = twitchParent();
  if (url.hostname.includes("twitch.tv")) {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "videos" && parts[1]) {
      return {
        provider: "twitch",
        embedUrl: `https://player.twitch.tv/?video=${parts[1]}&parent=${parent}&autoplay=false`,
        watchUrl: url.toString(),
        kind: "video",
      };
    }
    if (parts[0] === "clip" && parts[1]) {
      return {
        provider: "twitch",
        embedUrl: `https://clips.twitch.tv/embed?clip=${parts[1]}&parent=${parent}`,
        watchUrl: url.toString(),
        kind: "clip",
      };
    }
    if (parts[1] === "clip" && parts[2]) {
      return {
        provider: "twitch",
        embedUrl: `https://clips.twitch.tv/embed?clip=${parts[2]}&parent=${parent}`,
        watchUrl: url.toString(),
        kind: "clip",
      };
    }
    return {
      provider: "twitch",
      embedUrl: null,
      watchUrl: url.toString(),
      kind: "unknown",
    };
  }

  if (url.hostname.includes("tiktok.com")) {
    return {
      provider: "tiktok",
      embedUrl: null,
      watchUrl: url.toString(),
      kind: "video",
    };
  }

  return {
    provider: "other",
    embedUrl: null,
    watchUrl: url.toString(),
    kind: "unknown",
  };
}

export function isSupportedClipUrl(raw: string) {
  const parsed = parseClipUrl(raw);
  if (!parsed) return false;
  return ["youtube", "twitch", "tiktok"].includes(parsed.provider);
}
