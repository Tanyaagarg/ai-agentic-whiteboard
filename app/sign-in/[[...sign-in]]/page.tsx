import AuthLayout from "@/components/custom/auth/AuthLayout";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <AuthLayout>
      {/* Clerk's card carries its own "Don't have an account? Sign up" link,
          so there is no second footer here. */}
      <SignIn />
    </AuthLayout>
  );
}
