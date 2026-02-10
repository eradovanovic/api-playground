"use client";
import { useEffect } from "react";
import { initMocks } from "./init";

export default function MswProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function start() {
      initMocks()
    }
    start();
  }, []);

  return <>{children}</>;
}