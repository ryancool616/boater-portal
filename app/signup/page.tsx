import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <AuthForm mode="signup" />
        <p className="text-sm text-slate-600">
          Already have an account? <Link className="underline" href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
