import SigninLandingPage from "@/components/landing/signin-landing-page";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <Suspense>
      <SigninLandingPage />
    </Suspense>
  );
}
