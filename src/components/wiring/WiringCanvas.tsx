// WIRING CANVAS
// This file contains the wiring diagram editor, which is used to create and edit wiring diagrams.

"use client";

// IMPORTS
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type OnSelectionChangeParams,
  type Viewport,
} from "@xyflow/react";
import { saveDiagramFlow } from "@/actions/diagrams";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import {
  COMPONENT_KINDS,
  EMPTY_FLOW,
  WIRE_COLORS,
  WIRE_KINDS,
  type ComponentKind,
  type FlowDocument,
  type WireKind,
} from "@/lib/types";
import { nodeTypes, type WiringNode } from "./nodes";


// TYPES
type DiagramOption = { id: string; title: string };

type WireData = {
  color: string;
  gauge: string;
  kind: WireKind;
  label: string;
};


// As Flow
// Converts a raw flow document to the format expected by ReactFlow
function asFlow(raw: FlowDocument | null | undefined): { nodes: Node[]; edges: Edge[]; viewport: Viewport } {
  const doc = raw ?? EMPTY_FLOW;
  return {
    nodes: (doc.nodes as Node[]) ?? [],
    edges: (doc.edges as Edge[]) ?? [],
    viewport: doc.viewport ?? { x: 0, y: 0, zoom: 1 },
  };
}

// MAIN FUNCTION
export function WiringCanvas({
  carId,
  diagramId,
  initial,
  backgroundUrl,
  diagrams,
}: {
  carId: string;
  diagramId: string;
  initial: FlowDocument;
  backgroundUrl: string | null;
  diagrams: DiagramOption[];
}) {
  const seed = useMemo(() => asFlow(initial), [initial]);
  const [nodes, setNodes, onNodesChange] = useNodesState(seed.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(seed.edges);
  const viewportRef = useRef<Viewport>(seed.viewport);
  const [selected, setSelected] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty">("saved");

  // On Connect
  // Adds a new edge to the diagram when a connection is made between two nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      const id = crypto.randomUUID();
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            id,
            data: { color: "#ef4444", gauge: "18 AWG", kind: "power", label: "" } satisfies WireData,
            style: { stroke: "#ef4444", strokeWidth: 2 },
            label: "",
          },
          current,
        ),
      );
      setSaveState("dirty");
    },
    [setEdges],
  );


  // Add Node
  // Adds a new node to the diagram based on the specified type (component, zone, or portal)
  const addNode = (type: WiringNode["type"]) => {
    const id = crypto.randomUUID();
    const position = { x: 120 + Math.random() * 80, y: 80 + Math.random() * 80 };
    if (type === "component") {
      setNodes((n) => [
        ...n,
        {
          id,
          type,
          position,
          data: { label: "New component", kind: "ecu" as ComponentKind, notes: "" },
        },
      ]);
    } else if (type === "zone") {
      setNodes((n) => [...n, { id, type, position, data: { label: "Engine bay" }, style: { width: 240, height: 160 } }]);
    } else {
      setNodes((n) => [
        ...n,
        {
          id,
          type,
          position,
          data: { label: "Continue in…", targetDiagramId: "", carId },
        },
      ]);
    }
    setSaveState("dirty");
  };


  // Persist
  // Saves the current state of the diagram to the server
  const persist = useCallback(async () => {
    setSaveState("saving");
    const flow: FlowDocument = {
      nodes,
      edges,
      viewport: viewportRef.current,
    };
    await saveDiagramFlow(diagramId, carId, flow);
    setSaveState("saved");
  }, [nodes, edges, diagramId, carId]);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setSaveState("dirty");
  }, [nodes, edges]);

  useEffect(() => {
    if (saveState !== "dirty") return;
    const t = setTimeout(() => {
      void persist();
    }, 800);
    return () => clearTimeout(t);
  }, [saveState, persist]);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelected({ nodes: params.nodes, edges: params.edges });
  }, []);

  const selectedNode = selected.nodes[0];
  const selectedEdge = selected.edges[0];


  // Patch Node
  // Updates the data of a specific node in the diagram
  function patchNode(id: string, data: Record<string, unknown>) {
    setNodes((current) =>
      current.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
    );
    setSaveState("dirty");
  }

  
  // Patch Edge
  // Updates the data of a specific edge in the diagram
  function patchEdge(id: string, data: Partial<WireData>) {
    setEdges((current) =>
      current.map((e) => {
        if (e.id !== id) return e;
        const next = { ...(e.data as WireData), ...data };
        return {
          ...e,
          data: next,
          label: next.label || `${next.gauge} ${next.kind}`,
          style: { ...e.style, stroke: next.color, strokeWidth: 2 },
        };
      }),
    );
    setSaveState("dirty");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="overflow-hidden rounded-xl border border-border" style={{ height: "70vh" }}>
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2">
          <Button type="button" variant="outline" onClick={() => addNode("component")}>
            Component
          </Button>
          <Button type="button" variant="outline" onClick={() => addNode("zone")}>
            Zone
          </Button>
          <Button type="button" variant="outline" onClick={() => addNode("portal")}>
            Jump
          </Button>
          <Button type="button" variant="ghost" onClick={() => void persist()}>
            Save now
          </Button>
          <span className="ml-auto text-xs text-muted">
            {saveState === "saving" ? "Saving…" : saveState === "dirty" ? "Unsaved" : "Saved"}
          </span>
        </div>
        <div className="h-[calc(70vh-49px)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            onMoveEnd={(_, vp) => {
              viewportRef.current = vp;
              setSaveState("dirty");
            }}
            nodeTypes={nodeTypes}
            defaultViewport={seed.viewport}
            fitView={seed.nodes.length === 0}
            colorMode="dark"
            style={
              backgroundUrl
                ? {
                    backgroundImage: `linear-gradient(rgba(12,11,10,0.55), rgba(12,11,10,0.55)), url(${backgroundUrl})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            <Background gap={18} color="#2a2622" />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </div>
      <aside className="space-y-4">
        {!selectedNode && !selectedEdge ? (
          <p className="text-sm text-muted">
            Select a component or wire. Double-click a jump node after pointing it at another diagram.
          </p>
        ) : null}
        {selectedNode?.type === "component" ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Component</h3>
            <Field label="Name">
              <Input
                value={String(selectedNode.data.label ?? "")}
                onChange={(e) => patchNode(selectedNode.id, { label: e.target.value })}
              />
            </Field>
            <Field label="Kind">
              <Select
                value={String(selectedNode.data.kind ?? "other")}
                onChange={(e) => patchNode(selectedNode.id, { kind: e.target.value })}
              >
                {COMPONENT_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Notes">
              <Textarea
                rows={4}
                value={String(selectedNode.data.notes ?? "")}
                onChange={(e) => patchNode(selectedNode.id, { notes: e.target.value })}
              />
            </Field>
          </div>
        ) : null}
        {selectedNode?.type === "zone" ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Zone</h3>
            <Field label="Name">
              <Input
                value={String(selectedNode.data.label ?? "")}
                onChange={(e) => patchNode(selectedNode.id, { label: e.target.value })}
              />
            </Field>
          </div>
        ) : null}
        {selectedNode?.type === "portal" ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Jump</h3>
            <Field label="Label">
              <Input
                value={String(selectedNode.data.label ?? "")}
                onChange={(e) => patchNode(selectedNode.id, { label: e.target.value })}
              />
            </Field>
            <Field label="Target diagram">
              <Select
                value={String(selectedNode.data.targetDiagramId ?? "")}
                onChange={(e) => patchNode(selectedNode.id, { targetDiagramId: e.target.value })}
              >
                <option value="">Choose…</option>
                {diagrams
                  .filter((d) => d.id !== diagramId)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
              </Select>
            </Field>
          </div>
        ) : null}
        {selectedEdge ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Wire</h3>
            <Field label="Label">
              <Input
                value={String((selectedEdge.data as WireData | undefined)?.label ?? "")}
                onChange={(e) => patchEdge(selectedEdge.id, { label: e.target.value })}
              />
            </Field>
            <Field label="Gauge">
              <Input
                value={String((selectedEdge.data as WireData | undefined)?.gauge ?? "")}
                onChange={(e) => patchEdge(selectedEdge.id, { gauge: e.target.value })}
                placeholder="18 AWG"
              />
            </Field>
            <Field label="Type">
              <Select
                value={String((selectedEdge.data as WireData | undefined)?.kind ?? "other")}
                onChange={(e) => patchEdge(selectedEdge.id, { kind: e.target.value as WireKind })}
              >
                {WIRE_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Color">
              <div className="flex flex-wrap gap-1.5">
                {WIRE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => patchEdge(selectedEdge.id, { color: c })}
                    className="h-6 w-6 rounded-full border border-border"
                    style={{ background: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </Field>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
