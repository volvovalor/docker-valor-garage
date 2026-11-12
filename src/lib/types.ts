// TYPES
// Utility types and constants for the project

// CARS
export type CarSpecs = {
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  fuel?: string;
  ecu?: string;
  displacement?: string;
};


// PARTS
export type CustomPart = {
  id: string;
  name: string;
  category: string;
  notes: string;
};


// JOBS
export type ProjectCategory = "maintenance" | "repair" | "custom" | "other";
export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: "maintenance", label: "Maintenance" },
  { value: "repair", label: "Repair" },
  { value: "custom", label: "Custom" },
  { value: "other", label: "Other" },
];

export type JobStatus = "todo" | "in_progress" | "done";
export const JOB_STATUSES: { value: JobStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];


// WIRING
export type ComponentKind =
  | "ecu"
  | "relay"
  | "fuse"
  | "sensor"
  | "gauge"
  | "battery"
  | "connector"
  | "other";
export const COMPONENT_KINDS: { value: ComponentKind; label: string }[] = [
  { value: "ecu", label: "ECU" },
  { value: "relay", label: "Relay" },
  { value: "fuse", label: "Fuse" },
  { value: "sensor", label: "Sensor" },
  { value: "gauge", label: "Gauge" },
  { value: "battery", label: "Battery" },
  { value: "connector", label: "Connector" },
  { value: "other", label: "Other" },
];


export type WireKind = "power" | "ground" | "signal" | "can" | "other";
export const WIRE_KINDS: { value: WireKind; label: string }[] = [
  { value: "power", label: "Power" },
  { value: "ground", label: "Ground" },
  { value: "signal", label: "Signal" },
  { value: "can", label: "CAN / bus" },
  { value: "other", label: "Other" },
];

export const WIRE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#a8a29e",
  "#fafaf9",
  "#171717",
  "#92400e",
];

export type FlowViewport = { x: number; y: number; zoom: number };

export type FlowDocument = {
  nodes: unknown[];
  edges: unknown[];
  viewport: FlowViewport;
};
export const EMPTY_FLOW: FlowDocument = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};
