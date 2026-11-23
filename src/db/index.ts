// INDEX
// Database initialization and connection management

// IMPORTS
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { databaseFile, uploadsDir } from "@/lib/paths";
import { applyQueuedRestore } from "@/lib/backups";
import * as schema from "./schema";


// Create SQL
// Statements to create the necessary tables in the database
// - Cars
// - Photos
// - Projects
// - Tasks
// - Diagrams
// - Diagram Links
// - Warehouse Items
const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS garage_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cars (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  vin TEXT,
  color TEXT,
  notes TEXT,
  specs TEXT NOT NULL DEFAULT '{}',
  custom_parts TEXT NOT NULL DEFAULT '[]',
  cover_photo_id TEXT,
  archived_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS fuel_entries (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  logged_at INTEGER NOT NULL,
  odometer_km REAL NOT NULL CHECK (odometer_km >= 0),
  liters REAL NOT NULL CHECK (liters > 0),
  fuel_type TEXT NOT NULL,
  price_per_liter REAL NOT NULL CHECK (price_per_liter >= 0),
  discount REAL NOT NULL CHECK (discount BETWEEN 0 AND 100),
  full_tank INTEGER NOT NULL CHECK (full_tank IN (0, 1)),
  missed_previous INTEGER NOT NULL CHECK (missed_previous IN (0, 1)),
  station TEXT NOT NULL,
  notes TEXT NOT NULL,
  receipt_mime TEXT,
  receipt BLOB
);

CREATE INDEX IF NOT EXISTS fuel_entries_car_time_idx ON fuel_entries(car_id, logged_at);

CREATE TABLE IF NOT EXISTS vehicle_expenses (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  logged_at INTEGER NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0)
);

CREATE INDEX IF NOT EXISTS vehicle_expenses_car_time_idx ON vehicle_expenses(car_id, logged_at);


CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  target_date TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS diagrams (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  flow_json TEXT NOT NULL DEFAULT '{"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}}',
  background_filename TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS diagram_links (
  id TEXT PRIMARY KEY,
  from_diagram_id TEXT NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
  from_node_id TEXT NOT NULL,
  to_diagram_id TEXT NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
  to_node_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS warehouse_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  barcode TEXT,
  location TEXT NOT NULL DEFAULT 'Unassigned',
  quantity REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  reorder_at REAL NOT NULL DEFAULT 0,
  supplier TEXT,
  unit_cost_cents INTEGER,
  purchase_date TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS warehouse_items_barcode_idx ON warehouse_items(barcode);
CREATE INDEX IF NOT EXISTS warehouse_items_sku_idx ON warehouse_items(sku);
`;


// Database connection variable
type Db = ReturnType<typeof open>;
declare global {
  var __valorGarageDb: Db | undefined;
}


// Open
// Open a connection to the database
function open() {
  applyQueuedRestore();
  const file = databaseFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.mkdirSync(uploadsDir(), { recursive: true });
  const sqlite = new Database(file);
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("journal_mode = WAL");
  sqlite.exec(CREATE_SQL);
  return drizzle(sqlite, { schema });
}


// Get DB
// Get the database connection, initializing it if necessary
export function getDb() {
  globalThis.__valorGarageDb ??= open();
  return globalThis.__valorGarageDb;
}
