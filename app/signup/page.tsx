import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getOptionalUser } from "@/lib/auth/current-user";

export const metadata = { title: "Create account" };
export const instant = false;

export default async function Page() {
  const user = await getOptionalUser();
  if (user) redirect("/dashboard");
  return (
    <main className="mx-auto grid w-full max-w-md flex-1 content-center px-6 py-16">
      <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-6">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <div className="mt-6">
          <AuthForm mode="signup" nextPath="/dashboard" />
        </div>
      </div>
    </main>
  );
}
