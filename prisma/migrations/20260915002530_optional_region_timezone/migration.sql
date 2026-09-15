-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LfgPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "rank" TEXT,
    "rolesNeeded" TEXT,
    "region" TEXT NOT NULL DEFAULT 'Global',
    "voice" BOOLEAN NOT NULL DEFAULT false,
    "discordLink" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LfgPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LfgPost" ("createdAt", "discordLink", "expiresAt", "game", "id", "platform", "rank", "region", "rolesNeeded", "updatedAt", "userId", "voice") SELECT "createdAt", "discordLink", "expiresAt", "game", "id", "platform", "rank", "region", "rolesNeeded", "updatedAt", "userId", "voice" FROM "LfgPost";
DROP TABLE "LfgPost";
ALTER TABLE "new_LfgPost" RENAME TO "LfgPost";
CREATE INDEX "LfgPost_expiresAt_idx" ON "LfgPost"("expiresAt");
CREATE INDEX "LfgPost_game_idx" ON "LfgPost"("game");
CREATE INDEX "LfgPost_platform_idx" ON "LfgPost"("platform");
CREATE INDEX "LfgPost_region_idx" ON "LfgPost"("region");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "passwordHash" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "region" TEXT NOT NULL DEFAULT '',
    "timezone" TEXT NOT NULL DEFAULT '',
    "dateOfBirth" DATETIME,
    "tosAcceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "bio", "createdAt", "dateOfBirth", "displayName", "email", "emailVerified", "id", "image", "name", "passwordHash", "region", "timezone", "tosAcceptedAt", "updatedAt") SELECT "avatarUrl", "bio", "createdAt", "dateOfBirth", "displayName", "email", "emailVerified", "id", "image", "name", "passwordHash", "region", "timezone", "tosAcceptedAt", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
