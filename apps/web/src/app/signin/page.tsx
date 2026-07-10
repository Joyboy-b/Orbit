import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in | Orbit" };

export default function SignInPage() {
  return <AuthForm mode="login" />;
}
