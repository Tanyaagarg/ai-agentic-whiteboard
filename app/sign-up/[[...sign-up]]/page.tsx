import AuthLayout from "@/components/custom/auth/AuthLayout";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp />
    </AuthLayout>
  );
}
