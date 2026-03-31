import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm text-sky-300">Boater Portal</p>
          <h1 className="text-5xl font-semibold tracking-tight">Full-stack starter with Supabase auth and Stripe billing.</h1>
          <p className="mt-6 text-lg text-slate-300">
            A real Next.js base for owners, providers, and captains with protected routes, subscription checkout,
            webhook handling, and room for vessel records, requests, quotes, and appointments.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild><Link href="/signup">Get started</Link></Button>
            <Button asChild variant="outline"><Link href="/login">Log in</Link></Button>
          </div>
        </div>
      </div>
    </main>
  );
}
