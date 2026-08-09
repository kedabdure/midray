import fs from "node:fs";
import path from "node:path";
import { auth } from "../src/lib/auth";
import { prisma } from "../prisma/db";

// Automatically load .env into process.env if present
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...valueParts] = trimmed.split("=");
      const val = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

async function main() {
  const email = "admin@dewaclinic.com";
  const name = "admin";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin123!";

  console.log(`Checking if user ${email} already exists in database...`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`Re-seeding user (${email}). Removing old record to reset password...`);
    await prisma.user.delete({
      where: { email },
    });
  }

  console.log(`Creating seed user: ${name} <${email}>...`);

  try {
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (response) {
      console.log("\n==============================================");
      console.log("🎉 Seed User Successfully Created!");
      console.log(`   Name:     ${name}`);
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${password}`);
      console.log("==============================================\n");
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
