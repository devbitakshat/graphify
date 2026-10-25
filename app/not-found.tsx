import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-lg flex-1 place-items-center px-6 py-20 text-center">
      <div>
        <h1 className="text-2xl font-semibold">That page is not here</h1>
        <Link href="/dashboard" className="button mt-4">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
