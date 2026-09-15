"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { MIN_AGE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { ageFromDob } from "@/lib/time";

export type ActionState = { error?: string; ok?: boolean } | null;

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formString(formData, "email").toLowerCase();
  const password = formString(formData, "password");
  const displayName = formString(formData, "displayName");
  const dobRaw = formString(formData, "dateOfBirth");
  const accepted = formData.get("acceptTos") === "on";

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password needs to be at least 8 characters." };
  }
  if (displayName.length < 2) {
    return { error: "Display name needs at least 2 characters." };
  }
  if (!dobRaw) {
    return { error: "Add your date of birth so we can check the age gate." };
  }
  if (!accepted) {
    return { error: "Please accept the Terms and confirm you are 13 or over." };
  }

  const dob = new Date(`${dobRaw}T00:00:00`);
  if (Number.isNaN(dob.getTime()) || ageFromDob(dob) < MIN_AGE) {
    return { error: `You need to be ${MIN_AGE} or over to join PartyGrid.` };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "That email is already on the grid. Try signing in." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: displayName,
      displayName,
      dateOfBirth: dob,
      tosAcceptedAt: new Date(),
      region: "Oceania",
      timezone: "Australia/Melbourne",
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try signing in." };
    }
    throw error;
  }
  return { ok: true };
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formString(formData, "email").toLowerCase();
  const password = formString(formData, "password");
  const callbackUrl = formString(formData, "callbackUrl") || "/";
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
  return { ok: true };
}

export async function oauthSignIn(provider: "google" | "discord") {
  await signIn(provider, { redirectTo: "/onboarding" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function completeOnboardingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireSessionUser();
  const dobRaw = formString(formData, "dateOfBirth");
  const accepted = formData.get("acceptTos") === "on";
  if (!dobRaw) return { error: "Date of birth is required." };
  if (!accepted) {
    return { error: "Please accept the Terms and confirm you are 13 or over." };
  }
  const dob = new Date(`${dobRaw}T00:00:00`);
  if (Number.isNaN(dob.getTime()) || ageFromDob(dob) < MIN_AGE) {
    return { error: `You need to be ${MIN_AGE} or over to use PartyGrid.` };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      dateOfBirth: dob,
      tosAcceptedAt: new Date(),
    },
  });
  redirect("/");
}
