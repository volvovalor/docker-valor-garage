// QUERIES
// This file contains functions for querying the database using Drizzle ORM.

// IMPORTS
import { asc, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "./index";
import {
  cars,
  diagrams,
  photos,
  projects,
  tasks,
  type Car,
  type Diagram,
  type Photo,
  type Project,
  type Task,
} from "./schema";


// CARS
// List Cars - Fetches a list of cars from the database, optionally including archived cars.
export async function listCars(includeArchived = false) {
  const db = getDb();
  const rows = await db.select().from(cars).orderBy(asc(cars.nickname));
  return includeArchived ? rows : rows.filter((c) => !c.archivedAt);
}

// Get Car - Fetches a single car by its ID from the database.
export async function getCar(id: string): Promise<Car | undefined> {
  const db = getDb();
  const rows = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
  return rows[0];
}

// List Active Cars - Fetches a list of active (non-archived) cars from the database, ordered by nickname.
export async function listActiveCars() {
  const db = getDb();
  return db.select().from(cars).where(isNull(cars.archivedAt)).orderBy(asc(cars.nickname));
}


// PHOTOS
// List Photos - Fetches a list of photos for a specific car, ordered by sort order and creation date.
export async function listPhotos(carId: string): Promise<Photo[]> {
  const db = getDb();
  return db
    .select()
    .from(photos)
    .where(eq(photos.carId, carId))
    .orderBy(asc(photos.sortOrder), desc(photos.createdAt));
}

// Get Photo - Fetches a single photo by its ID from the database.
export async function getPhoto(id: string): Promise<Photo | undefined> {
  const db = getDb();
  const rows = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
  return rows[0];
}

// Photo URL - Constructs the URL for accessing a photo file based on the car ID and filename.
export function photoUrl(carId: string, filename: string) {
  return `/api/files/${carId}/${filename}`;
}

// Cover URL - Determines the cover photo URL for a car, using the cover photo ID if available, or the first photo in the list.
export function coverUrl(car: Car, photosForCar: Photo[]) {
  const cover =
    (car.coverPhotoId && photosForCar.find((p) => p.id === car.coverPhotoId)) ||
    photosForCar[0];
  return cover ? photoUrl(car.id, cover.filename) : null;
}


// PROJECTS
// List Projects - Fetches a list of projects, optionally filtered by car ID, and includes the car's nickname.
export async function listProjects(carId?: string): Promise<(Project & { carNickname: string })[]> {
  const db = getDb();
  const q = db
    .select({
      id: projects.id,
      carId: projects.carId,
      title: projects.title,
      category: projects.category,
      status: projects.status,
      notes: projects.notes,
      targetDate: projects.targetDate,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      carNickname: cars.nickname,
    })
    .from(projects)
    .innerJoin(cars, eq(projects.carId, cars.id))
    .orderBy(desc(projects.updatedAt));
  const rows = await q;
  return carId ? rows.filter((r) => r.carId === carId) : rows;
}

// Get Project - Fetches a single project by its ID from the database.
export async function getProject(id: string): Promise<Project | undefined> {
  const db = getDb();
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return rows[0];
}


// TASKS
// List Tasks - Fetches a list of tasks for a specific project, ordered by sort order and creation date.
export async function listTasks(projectId: string): Promise<Task[]> {
  const db = getDb();
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.sortOrder), asc(tasks.createdAt));
}


// DIAGRAMS
// List Diagrams - Fetches a list of diagrams for a specific car, ordered by sort order and title.
export async function listDiagrams(carId: string): Promise<Diagram[]> {
  const db = getDb();
  return db
    .select()
    .from(diagrams)
    .where(eq(diagrams.carId, carId))
    .orderBy(asc(diagrams.sortOrder), asc(diagrams.title));
}

// Get Diagram - Fetches a single diagram by its ID from the database.
export async function getDiagram(id: string): Promise<Diagram | undefined> {
  const db = getDb();
  const rows = await db.select().from(diagrams).where(eq(diagrams.id, id)).limit(1);
  return rows[0];
}
