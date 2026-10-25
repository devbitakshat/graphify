"use server";

import { requireUser } from "@/lib/auth/current-user";
import {
  createConcept,
  createRelationship,
  removeConcept,
  removeRelationship,
  saveNodePosition,
  setConceptStatus,
  updateConcept,
} from "@/lib/data/repository";
import { isOneOf, priorities, relationships, statuses, type KnowledgeStatus, type Priority } from "@/lib/domain";
import { cleanUrl, readString } from "@/lib/forms";
import { revalidateSpace } from "@/lib/revalidate-space";

export type ConceptState = { error: string } | { ok: true; savedAt: number } | null;

export async function addConceptAction(_state: ConceptState, formData: FormData): Promise<ConceptState> {
  const user = await requireUser();
  const spaceId = readString(formData, "spaceId");
  const title = readString(formData, "title");
  const status = readString(formData, "status");
  const note = readString(formData, "note");
  const parentId = readString(formData, "parentId");
  const urlResult = cleanUrl(readString(formData, "url"));
  if (!urlResult.ok) return { error: urlResult.error };
  if (title.length < 1 || title.length > 120) return { error: "Enter a concept name." };
  if (note.length > 500) return { error: "Keep the note under 500 characters." };
  if (!isOneOf(statuses, status)) return { error: "Choose a knowledge state." };
  const result = await createConcept(user.id, spaceId, {
    title,
    status,
    url: urlResult.url,
    note,
    parentId: parentId || null,
  });
  if (result?.error) return result;
  revalidateSpace(spaceId);
  return { ok: true, savedAt: Date.now() };
}

export async function updateConceptAction(conceptId: string, formData: FormData): Promise<ConceptState> {
  const user = await requireUser();
  const title = readString(formData, "title");
  const status = readString(formData, "status");
  const priority = readString(formData, "priority");
  const note = readString(formData, "note");
  const parentId = readString(formData, "parentId");
  const urlResult = cleanUrl(readString(formData, "url"));
  if (!urlResult.ok) return { error: urlResult.error };
  if (title.length < 1 || title.length > 120) return { error: "Enter a concept name." };
  if (note.length > 500) return { error: "Keep the note under 500 characters." };
  if (!isOneOf(statuses, status) || !isOneOf(priorities, priority)) {
    return { error: "Choose a status and priority." };
  }
  const saved = await updateConcept(user.id, conceptId, {
    title,
    status: status as KnowledgeStatus,
    priority: priority as Priority,
    url: urlResult.url,
    note,
    parentId: parentId || null,
  });
  if (!("spaceId" in saved) || !saved.spaceId) {
    return { error: "error" in saved && saved.error ? saved.error : "Could not save the concept." };
  }
  revalidateSpace(saved.spaceId);
  return null;
}

export async function setStatusAction(conceptId: string, status: KnowledgeStatus): Promise<ConceptState> {
  const user = await requireUser();
  if (!isOneOf(statuses, status)) return { error: "Choose a knowledge state." };
  const saved = await setConceptStatus(user.id, conceptId, status);
  if (!("spaceId" in saved) || !saved.spaceId) {
    return { error: "error" in saved && saved.error ? saved.error : "Could not update the status." };
  }
  revalidateSpace(saved.spaceId);
  return null;
}

export async function removeConceptAction(conceptId: string): Promise<ConceptState> {
  const user = await requireUser();
  const removed = await removeConcept(user.id, conceptId);
  if (!("spaceId" in removed) || !removed.spaceId) {
    return { error: "error" in removed && removed.error ? removed.error : "Could not remove the concept." };
  }
  revalidateSpace(removed.spaceId);
  return null;
}

export async function savePositionAction(conceptId: string, x: number, y: number) {
  const user = await requireUser();
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  await saveNodePosition(user.id, conceptId, x, y);
}

export async function addRelationshipAction(spaceId: string, formData: FormData): Promise<ConceptState> {
  const user = await requireUser();
  const sourceId = readString(formData, "sourceId");
  const targetId = readString(formData, "targetId");
  const relationship = readString(formData, "relationship");
  if (!isOneOf(relationships, relationship)) return { error: "Choose what this relationship means." };
  const result = await createRelationship(user.id, spaceId, sourceId, targetId, relationship);
  if (result?.error) return result;
  revalidateSpace(spaceId);
  return null;
}

export async function removeRelationshipAction(edgeId: string): Promise<ConceptState> {
  const user = await requireUser();
  const removed = await removeRelationship(user.id, edgeId);
  if (!("spaceId" in removed) || !removed.spaceId) {
    return { error: "error" in removed && removed.error ? removed.error : "Could not remove the relationship." };
  }
  revalidateSpace(removed.spaceId);
  return null;
}
