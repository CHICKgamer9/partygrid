import { parseClipUrl } from "@/lib/clips";

export function ClipEmbed({ url, title }: { url: string; title: string }) {
  const parsed = parseClipUrl(url);

  if (parsed?.embedUrl) {
    return (
      <div className="aspect-video overflow-hidden bg-black">
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <a
      href={parsed?.watchUrl ?? url}
      target="_blank"
      rel="noreferrer"
      className="flex aspect-video items-center justify-center bg-[#0b0f14] px-4 text-center text-sm text-muted hover:text-accent"
    >
      {parsed?.provider === "tiktok"
        ? "Open this TikTok clip"
        : "Open clip in a new tab"}
    </a>
  );
}
