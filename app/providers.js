"use client";

import { AuthProvider } from "@/components/context/AuthContext";

// Client-side providers wrapper so app/layout.js can stay a server component.
export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
