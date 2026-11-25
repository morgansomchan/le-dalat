"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/** Records the visit's source on the first page the guest lands on. */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
