// INDEX
// Database initialization and connection management

// IMPORTS
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { databaseFile, uploadsDir } from "@/lib/paths";
import * as schema from "./schema";


// Create SQL
// Statements to create the necessary tables in the database
// - Cars
// - Photos
// - Projects
// - Tasks
// - Diagrams
// - Diagram Links
const CREATE_SQL = `
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
`;


// Database connection variable
type Db = ReturnType<typeof drizzle<typeof schema>>;
declare global {
  var __valorGarageDb: Db | undefined;
}


// Open
// Open a connection to the database
function open() {
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
