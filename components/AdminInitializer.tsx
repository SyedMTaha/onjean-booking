"use client";

import { useEffect } from "react";
import { ensureDefaultAdminCredentials } from "@/lib/adminService";

export function AdminInitializer() {
  useEffect(() => {
    const initAdmin = async () => {
      try {
        await ensureDefaultAdminCredentials();
      } catch (error) {
        console.error("Failed to initialize admin credentials:", error);
      }
    };

    initAdmin();
  }, []);

  return null;
}
