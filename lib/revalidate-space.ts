import { revalidatePath } from "next/cache";

export function revalidateSpace(spaceId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/spaces/${spaceId}`);
  revalidatePath(`/spaces/${spaceId}/graph`);
}
