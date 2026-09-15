import { displayNameOf } from "@/components/ui";

export function UserAvatar({
  user,
  size = 40,
}: {
  user: {
    displayName?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
    image?: string | null;
    email?: string | null;
  };
  size?: number;
}) {
  const name = displayNameOf(user);
  const src = user.avatarUrl || user.image;
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover ring-1 ring-line"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-accent/80 to-accent-2/80 font-bold text-black"
      style={{ width: size, height: size, fontSize: Math.max(11, size / 2.6) }}
      aria-hidden
    >
      {initials || "PG"}
    </span>
  );
}
