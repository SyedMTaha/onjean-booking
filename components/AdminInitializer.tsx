"use client";

import { useEffect } from "react";
import { ensureDefaultAdminCredentials } from "@/lib/adminService";

const isPermissionDeniedError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? String((error as { code?: unknown }).code || "") : "";
  return code === "permission-denied" || code.endsWith("/permission-denied");
};

export function AdminInitializer() {
  useEffect(() => {
    const initAdmin = async () => {
      try {
        await ensureDefaultAdminCredentials();
      } catch (error) {
        // Expected for clients without admin write access.
        if (!isPermissionDeniedError(error)) {
          console.error("Failed to initialize admin credentials:", error);
        }
      }
    };

    initAdmin();
  }, []);

  return null;
}
