"use server";

import { redirect } from "next/navigation";
import { getAiSummary } from "@/lib/ai/settings";
import { requireUser } from "@/lib/auth/current-user";
import { createSpace, deleteSpace, updateSpace, type LearningSpace } from "@/lib/data/repository";
import {
  depths,
  goals,
  isOneOf,
  levels,
  preferences,
  timeOptions,
  type Depth,
  type Goal,
  type Level,
  type Preference,
} from "@/lib/domain";
import { readString } from "@/lib/forms";
import { revalidateSpace } from "@/lib/revalidate-space";

export type SpaceState = { error: string } | null;

function settingsFromForm(formData: FormData): { ok: false; error: string } | { ok: true; value: Omit<LearningSpace, "id" | "userId" | "updatedAt"> } {
  const name = readString(formData, "name");
  const goal = readString(formData, "goal");
  const level = readString(formData, "level");
  const depth = readString(formData, "depth");
  const timeAvailable = readString(formData, "timeAvailable");
  const resourcePreference = readString(formData, "resourcePreference");
  if (name.length < 1 || name.length > 80) return { ok: false, error: "Name the learning space." };
  if (!isOneOf(goals, goal) || !isOneOf(levels, level) || !isOneOf(depths, depth)) {
    return { ok: false, error: "Choose a goal, level, and depth." };
  }
  if (!isOneOf(timeOptions, timeAvailable)) return { ok: false, error: "Choose how much time you have." };
  if (!isOneOf(preferences, resourcePreference)) return { ok: false, error: "Choose a resource preference." };
  return {
    ok: true,
    value: {
      name,
      goal: goal as Goal,
      level: level as Level,
      depth: depth as Depth,
      timeAvailable,
      resourcePreference: resourcePreference as Preference,
    },
  };
}

export async function createSpaceAction(_state: SpaceState, formData: FormData): Promise<SpaceState> {
  const user = await requireUser();
  if (!(await getAiSummary(user.id))) return { error: "Add your AI model and API key in settings first." };
  const settings = settingsFromForm(formData);
  if (!settings.ok) return { error: settings.error };
  const space = await createSpace(user.id, settings.value);
  redirect(`/spaces/${space.id}/graph`);
}

export async function updateSpaceAction(_state: SpaceState, formData: FormData): Promise<SpaceState> {
  const user = await requireUser();
  const spaceId = readString(formData, "spaceId");
  const settings = settingsFromForm(formData);
  if (!settings.ok) return { error: settings.error };
  const space = await updateSpace(user.id, spaceId, settings.value);
  if (!space) return { error: "Learning space not found." };
  revalidateSpace(space.id);
  return null;
}

export async function deleteSpaceAction(formData: FormData) {
  const user = await requireUser();
  const spaceId = readString(formData, "spaceId");
  await deleteSpace(user.id, spaceId);
  revalidateSpace(spaceId);
  redirect("/dashboard");
}
