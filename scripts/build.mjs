import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const databaseUrl = process.env.DATABASE_URL ?? "";
const schemaPath = new URL("../prisma/schema.prisma", import.meta.url);
const usingPostgres = /^postgres(ql)?:\/\//i.test(databaseUrl);

if (usingPostgres) {
  const schema = readFileSync(schemaPath, "utf8").replace(
    'provider = "sqlite"',
    'provider = "postgresql"',
  );
  writeFileSync(schemaPath, schema);
  console.log("Prisma provider set to postgresql for this build.");
}

function run(command) {
  execSync(command, { stdio: "inherit" });
}

run("npx prisma generate");

if (usingPostgres) {
  // SQLite migrations are not applied to Postgres. Push the portable schema.
  run("npx prisma db push");
}

run("npx next build");
