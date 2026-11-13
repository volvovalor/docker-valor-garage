// NODES
// This file contains the node types used in the wiring diagram editor.

"use client";

// IMPORTS
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useRouter } from "next/navigation";
import type { ComponentKind } from "@/lib/types";


// NODE DATA TYPES
export type ComponentData = {
  label: string;
  kind: ComponentKind;
  notes: string;
};

export type ZoneData = {
  label: string;
};

export type PortalData = {
  label: string;
  targetDiagramId: string;
  targetNodeId?: string;
  carId: string;
};

// NODE TYPES
export type ComponentNode = Node<ComponentData, "component">;
export type ZoneNode = Node<ZoneData, "zone">;
export type PortalNode = Node<PortalData, "portal">;
export type WiringNode = ComponentNode | ZoneNode | PortalNode;


// Component Node View
// Renders a component node in the wiring diagram editor.
export function ComponentNodeView({ data }: NodeProps<ComponentNode>) {
  return (
    <div className="min-w-[140px] rounded-lg border border-amber-700/40 bg-[#1c1916] px-3 py-2 shadow-lg">
      <Handle type="target" position={Position.Left} className="!bg-accent" />
      <p className="text-[10px] uppercase tracking-wide text-accent">{data.kind}</p>
      <p className="text-sm font-medium">{data.label || "Component"}</p>
      <Handle type="source" position={Position.Right} className="!bg-accent" />
    </div>
  );
}


// Zone Node View
// Renders a zone node in the wiring diagram editor.
export function ZoneNodeView({ data }: NodeProps<ZoneNode>) {
  return (
    <div className="flex h-[160px] w-[240px] items-start rounded-xl border border-dashed border-accent/40 bg-accent/5 px-3 py-2">
      <p className="text-xs uppercase tracking-[0.18em] text-accent">{data.label || "Zone"}</p>
    </div>
  );
}


// Portal Node View
// Renders a portal node in the wiring diagram editor, allowing navigation to related diagrams.
export function PortalNodeView({ data }: NodeProps<PortalNode>) {
  const router = useRouter();
  return (
    <div className="min-w-[150px] rounded-lg border border-sky-500/50 bg-[#15202b] px-3 py-2">
      <Handle type="target" position={Position.Left} className="!bg-sky-400" />
      <p className="text-[10px] uppercase tracking-wide text-sky-300">Jump</p>
      <p className="text-sm font-medium">{data.label || "Related diagram"}</p>
      {data.targetDiagramId ? (
        <button
          type="button"
          className="mt-1 text-xs text-sky-300 underline"
          onClick={() => router.push(`/cars/${data.carId}/wiring/${data.targetDiagramId}`)}
        >
          Open diagram
        </button>
      ) : (
        <p className="mt-1 text-xs text-muted">Pick a target in the inspector</p>
      )}
      <Handle type="source" position={Position.Right} className="!bg-sky-400" />
    </div>
  );
}


// NODE TYPES
export const nodeTypes = {
  component: ComponentNodeView,
  zone: ZoneNodeView,
  portal: PortalNodeView,
};
