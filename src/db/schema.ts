// SCHEMA
// This file defines the database schema using Drizzle ORM for a garage management application.

// IMPORTS
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { CarSpecs, CustomPart, FlowDocument } from "@/lib/types";


// CARS
// Defines the "cars" table with fields for car details, specifications, and metadata.
export const cars = sqliteTable("cars", {
  id: text("id").primaryKey(),
  nickname: text("nickname").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  vin: text("vin"),
  color: text("color"),
  notes: text("notes"),
  specs: text("specs", { mode: "json" }).$type<CarSpecs>().notNull().default({}),
  customParts: text("custom_parts", { mode: "json" })
    .$type<CustomPart[]>()
    .notNull()
    .default([]),
  coverPhotoId: text("cover_photo_id"),
  archivedAt: integer("archived_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});


// PHOTOS
// Defines the "photos" table with fields for photo details and metadata.
export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(),
  carId: text("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});


// PROJECTS
// Defines the "projects" table with fields for project details and metadata.
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  carId: text("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  targetDate: text("target_date"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});


// TASKS
// Defines the "tasks" table with fields for task details and metadata.
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  parentTaskId: text("parent_task_id"),
  title: text("title").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});


// DIAGRAMS
// Defines the "diagrams" table with fields for diagram details and metadata.
export const diagrams = sqliteTable("diagrams", {
  id: text("id").primaryKey(),
  carId: text("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  flowJson: text("flow_json", { mode: "json" })
    .$type<FlowDocument>()
    .notNull(),
  backgroundFilename: text("background_filename"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// DIAGRAM LINKS
// Defines the "diagram_links" table with fields for linking diagrams and metadata.
export const diagramLinks = sqliteTable("diagram_links", {
  id: text("id").primaryKey(),
  fromDiagramId: text("from_diagram_id")
    .notNull()
    .references(() => diagrams.id, { onDelete: "cascade" }),
  fromNodeId: text("from_node_id").notNull(),
  toDiagramId: text("to_diagram_id")
    .notNull()
    .references(() => diagrams.id, { onDelete: "cascade" }),
  toNodeId: text("to_node_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});


// SCHEMA EXPORTS
export type Car = typeof cars.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Diagram = typeof diagrams.$inferSelect;
export type DiagramLink = typeof diagramLinks.$inferSelect;
