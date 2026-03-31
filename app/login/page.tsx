import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <AuthForm mode="login" />
        <p className="text-sm text-slate-600">
          Need an account? <Link className="underline" href="/signup">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
