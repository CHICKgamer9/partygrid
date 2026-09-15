import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("squadstack", 12);
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
      email: "ash@squadstack.local",
      passwordHash,
      displayName: "Ash Vale",
      name: "Ash Vale",
      bio: "NA west, ranked queue, too much energy drink.",
      region: "Americas",
      timezone: "America/Los_Angeles",
      dateOfBirth: new Date("1998-04-12"),
      tosAcceptedAt: new Date(),
      gameTags: {
        create: [{ name: "Valorant" }, { name: "Marvel Rivals" }],
      },
      linkedAccounts: {
        create: [
          { platform: "discord", handle: "ashvale", verified: false },
          { platform: "riot", handle: "Ash#NA1", verified: false },
        ],
      },
    },
  });

  const riko = await prisma.user.create({
    data: {
      email: "riko@squadstack.local",
      passwordHash,
      displayName: "Riko Queue",
      name: "Riko Queue",
      bio: "Tokyo nights, down for customs after work.",
      region: "Asia",
      timezone: "Asia/Tokyo",
      dateOfBirth: new Date("1996-11-02"),
      tosAcceptedAt: new Date(),
      gameTags: {
        create: [{ name: "Helldivers 2" }, { name: "Apex Legends" }],
      },
      linkedAccounts: {
        create: [{ platform: "steam", handle: "riko_queue", verified: false }],
      },
    },
  });

  const nia = await prisma.user.create({
    data: {
      email: "nia@squadstack.local",
      passwordHash,
      displayName: "Nia Cross",
      name: "Nia Cross",
      bio: "EU evenings — clips, LFG, and a squad that actually stacks.",
      region: "Europe",
      timezone: "Europe/London",
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
          { platform: "discord", handle: "niacross", verified: false },
          { platform: "xbox", handle: "NiaCross", verified: false },
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
        region: "Americas",
        voice: true,
        discordLink: "https://discord.gg/squadstack",
        expiresAt: new Date(now + 5 * 60 * 60 * 1000),
      },
      {
        userId: riko.id,
        game: "Helldivers 2",
        platform: "PC",
        rank: "Super Citizen",
        rolesNeeded: "Anyone with a mic",
        region: "Asia",
        voice: true,
        discordLink: "https://discord.gg/squadstack",
        expiresAt: new Date(now + 10 * 60 * 60 * 1000),
      },
      {
        userId: nia.id,
        game: "Fortnite",
        platform: "PlayStation",
        rank: "Unreal-adjacent",
        rolesNeeded: "IGL + IGL-listener",
        region: "Europe",
        voice: true,
        expiresAt: new Date(now + 3 * 60 * 60 * 1000),
      },
      {
        userId: ash.id,
        game: "Marvel Rivals",
        platform: "PC",
        rank: "Gold",
        rolesNeeded: "Vanguard",
        region: "Global",
        voice: false,
        expiresAt: new Date(now - 2 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.clip.createMany({
    data: [
      {
        userId: nia.id,
        url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        title: "Warm-up clip energy",
        gameTag: "Fortnite",
        caption: "Seed clip so discover isn't empty.",
      },
      {
        userId: ash.id,
        url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        title: "Ranked moment",
        gameTag: "Valorant",
        caption: "Placeholder highlight for discover.",
      },
      {
        userId: riko.id,
        url: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
        title: "Democracy spread",
        gameTag: "Helldivers 2",
        caption: "For the reel.",
      },
    ],
  });

  const squad = await prisma.squad.create({
    data: {
      name: "Night Stack",
      slug: "night-stack",
      bio: "Cross-region crew. Discord is the call — SquadStack is the lobby.",
      games: "Fortnite, Valorant, Helldivers 2",
      discordLink: "https://discord.gg/squadstack",
      creatorId: nia.id,
    },
  });

  await prisma.squadMember.createMany({
    data: [
      { squadId: squad.id, userId: nia.id },
      { squadId: squad.id, userId: ash.id },
    ],
  });

  const utcDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - index);
    return date.toISOString().slice(0, 10);
  });

  await prisma.activityDay.createMany({
    data: utcDates.map((date) => ({ userId: nia.id, date })),
  });

  await prisma.userAchievement.createMany({
    data: [
      { userId: nia.id, slug: "linked-up" },
      { userId: nia.id, slug: "party-starter" },
      { userId: nia.id, slug: "clipped" },
      { userId: nia.id, slug: "squad-up" },
      { userId: nia.id, slug: "on-the-stack" },
      { userId: ash.id, slug: "linked-up" },
      { userId: ash.id, slug: "party-starter" },
      { userId: ash.id, slug: "clipped" },
      { userId: ash.id, slug: "squad-up" },
      { userId: riko.id, slug: "linked-up" },
      { userId: riko.id, slug: "party-starter" },
      { userId: riko.id, slug: "clipped" },
    ],
  });

  console.log("Seeded SquadStack demo users (password: squadstack)");
  console.log("  ash@squadstack.local / riko@squadstack.local / nia@squadstack.local");
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
