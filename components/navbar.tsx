"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="text-xl font-bold">TodoMaster</div>

          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="font-medium text-sm">
                  Hello, {user.firstName || "User"}
                </span>
                <Button variant="outline" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="outline" asChild>
                <Link href="/sign-in">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
