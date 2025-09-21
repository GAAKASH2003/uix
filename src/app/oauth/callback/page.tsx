"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      // Store token
      // localStorage.setItem("auth_token", token);
      Cookies.set("auth_token", token, {
        expires: 1, // 1 day
        secure: false, // Allow HTTP in development
        sameSite: "lax",
        path: "/",
      });
      // Redirect to dashboard
      router.push("/dashboard");
    } else {
      router.push("/login?error=oauth_failed");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg font-medium">Signing you in with Google...</p>
    </div>
  );
}
