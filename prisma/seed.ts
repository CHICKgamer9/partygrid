import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("partygrid", 12);
  const now = Date.now();

  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.activityDay.deleteMany();
  await prisma.squadMember.deleteMany();
  await prisma.squad.deleteMany();
  await prisma.clip.deleteMany();
  await prisma.lfgPost.deleteMany();
  await prisma.linkedAccount.deleteMany();
  await prisma.gameTag.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const ash = await prisma.user.create({
    data: {
      email: "ash@partygrid.local",
      passwordHash,
      displayName: "Oceania Ash",
      name: "Oceania Ash",
      bio: "Melbourne nights, ranked queue, too much energy drink.",
      region: "Oceania",
      timezone: "Australia/Melbourne",
      dateOfBirth: new Date("1998-04-12"),
      tosAcceptedAt: new Date(),
      gameTags: {
        create: [{ name: "Valorant" }, { name: "Marvel Rivals" }],
      },
      linkedAccounts: {
        create: [
          { platform: "discord", handle: "oceania_ash", verified: false },
          { platform: "riot", handle: "Ash#OCE", verified: false },
        ],
      },
    },
  });

  const kiwi = await prisma.user.create({
    data: {
      email: "kiwi@partygrid.local",
      passwordHash,
      displayName: "Kiwi Queue",
      name: "Kiwi Queue",
      bio: "Auckland-based, down for late AU customs.",
      region: "Oceania",
      timezone: "Pacific/Auckland",
      dateOfBirth: new Date("1996-11-02"),
      tosAcceptedAt: new Date(),
      gameTags: {
        create: [{ name: "Helldivers 2" }, { name: "Apex Legends" }],
      },
      linkedAccounts: {
        create: [{ platform: "steam", handle: "kiwi_queue", verified: false }],
      },
    },
  });

  const twin = await prisma.user.create({
    data: {
      email: "twinz@partygrid.local",
      passwordHash,
      displayName: "Twinz Lab",
      name: "Twinz Lab",
      bio: "Sleep Twinz dogfood account — clips, LFG, and a squad for AU nights.",
      region: "Oceania",
      timezone: "Australia/Melbourne",
      dateOfBirth: new Date("1995-06-20"),
      tosAcceptedAt: new Date(),
      gameTags: {
        create: [
          { name: "Fortnite" },
          { name: "Call of Duty" },
          { name: "Minecraft" },
        ],
      },
      linkedAccounts: {
        create: [
          { platform: "discord", handle: "sleeptwinz", verified: false },
          { platform: "xbox", handle: "SleepTwinzAU", verified: false },
        ],
      },
    },
  });

  await prisma.lfgPost.createMany({
    data: [
      {
        userId: ash.id,
        game: "Valorant",
        platform: "PC",
        rank: "Diamond",
        rolesNeeded: "Controller or initiator",
        region: "Oceania",
        voice: true,
        discordLink: "https://discord.gg/partygrid",
        expiresAt: new Date(now + 5 * 60 * 60 * 1000),
      },
      {
        userId: kiwi.id,
        game: "Helldivers 2",
        platform: "PC",
        rank: "Super Citizen",
        rolesNeeded: "Anyone with a mic",
        region: "Oceania",
        voice: true,
        discordLink: "https://discord.gg/partygrid",
        expiresAt: new Date(now + 10 * 60 * 60 * 1000),
      },
      {
        userId: twin.id,
        game: "Fortnite",
        platform: "PlayStation",
        rank: "Unreal-adjacent",
        rolesNeeded: "IGL + IGL-listener",
        region: "Oceania",
        voice: true,
        expiresAt: new Date(now + 3 * 60 * 60 * 1000),
      },
      {
        userId: ash.id,
        game: "Marvel Rivals",
        platform: "PC",
        rank: "Gold",
        rolesNeeded: "Vanguard",
        region: "Oceania",
        voice: false,
        expiresAt: new Date(now - 2 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.clip.createMany({
    data: [
      {
        userId: twin.id,
        url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        title: "Warm-up clip energy",
        gameTag: "Fortnite",
        caption: "Seed clip so the board isn't empty — swap for a Twinz upload.",
      },
      {
        userId: ash.id,
        url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        title: "OCE ranked moment",
        gameTag: "Valorant",
        caption: "Placeholder highlight for discover.",
      },
      {
        userId: kiwi.id,
        url: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
        title: "Democracy spread",
        gameTag: "Helldivers 2",
        caption: "For the reel.",
      },
    ],
  });

  const squad = await prisma.squad.create({
    data: {
      name: "Sleep Shift",
      slug: "sleep-shift",
      bio: "AU/NZ night crew. Discord is the call — PartyGrid is the lobby.",
      games: "Fortnite, Valorant, Helldivers 2",
      discordLink: "https://discord.gg/partygrid",
      creatorId: twin.id,
    },
  });

  await prisma.squadMember.createMany({
    data: [
      { squadId: squad.id, userId: twin.id },
      { squadId: squad.id, userId: ash.id },
    ],
  });

  const melbourneDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - index);
    return date.toLocaleDateString("en-CA", { timeZone: "Australia/Melbourne" });
  });

  await prisma.activityDay.createMany({
    data: melbourneDates.map((date) => ({ userId: twin.id, date })),
  });

  await prisma.userAchievement.createMany({
    data: [
      { userId: twin.id, slug: "linked-up" },
      { userId: twin.id, slug: "party-starter" },
      { userId: twin.id, slug: "clipped" },
      { userId: twin.id, slug: "squad-up" },
      { userId: twin.id, slug: "on-the-grid" },
      { userId: ash.id, slug: "linked-up" },
      { userId: ash.id, slug: "party-starter" },
      { userId: ash.id, slug: "clipped" },
      { userId: ash.id, slug: "squad-up" },
      { userId: kiwi.id, slug: "linked-up" },
      { userId: kiwi.id, slug: "party-starter" },
      { userId: kiwi.id, slug: "clipped" },
    ],
  });

  console.log("Seeded PartyGrid demo users (password: partygrid)");
  console.log("  ash@partygrid.local / kiwi@partygrid.local / twinz@partygrid.local");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
