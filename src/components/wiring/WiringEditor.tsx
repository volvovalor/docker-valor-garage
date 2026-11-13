// WIRING EDITOR
// This file contains the wiring diagram editor, which is used to create and edit wiring diagrams.

"use client";

// IMPORTS
import dynamic from "next/dynamic";
import type { FlowDocument } from "@/lib/types";

// DYNAMIC IMPORTS
const WiringCanvas = dynamic(() => import("./WiringCanvas").then((m) => m.WiringCanvas), {
  ssr: false,
  loading: () => <p className="text-sm text-muted">Loading canvas…</p>,
});

// MAIN FUNCTION
export function WiringEditor(props: {
  carId: string;
  diagramId: string;
  initial: FlowDocument;
  backgroundUrl: string | null;
  diagrams: { id: string; title: string }[];
}) {
  return <WiringCanvas {...props} />;
}
