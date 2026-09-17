"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch (err) {
      setIsSigningOut(false);
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      isLoading={isSigningOut}
      loadingText="خروج..."
      onClick={handleSignOut}
      className="rounded-full px-4"
    >
      خروج
    </Button>
  );
}
