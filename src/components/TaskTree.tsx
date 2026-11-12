// TASK TREE
// This component is used to display a hierarchical tree of tasks, 
// allowing users to add, update, delete, and toggle the status of tasks and subtasks.

"use client";

// IMPORTS
import { useState } from "react";
import { addTask, deleteTask, toggleTask, updateTaskTitle } from "@/actions/tasks";
import { Button, Input } from "@/components/ui";
import type { Task } from "@/db/schema";
import { cn } from "@/lib/cn";


// Node Type
// Represents a task node in the tree, including its children.
type Node = Task & { children: Node[] };


// Nest
// Takes flat array of tasks, nests them into a hierarchical structure.
// Returns an array of root nodes, each containing its children.
function nest(rows: Task[]): Node[] {
  const map = new Map<string, Node>();
  rows.forEach((t) => map.set(t.id, { ...t, children: [] }));
  const roots: Node[] = [];
  for (const t of rows) {
    const node = map.get(t.id)!;
    if (t.parentTaskId && map.has(t.parentTaskId)) {
      map.get(t.parentTaskId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}


// Task Tree
// Takes a carId, projectId, and an array of tasks as props. 
// Nests the tasks into a hierarchical structure and renders them as a tree.
// Users can add new tasks, update task titles, toggle task statuses, and delete tasks. 
// The component maintains local state for the title of a new task being added.
export function TaskTree({
  carId,
  projectId,
  tasks,
}: {
  carId: string;
  projectId: string;
  tasks: Task[];
}) {
  const tree = nest(tasks);
  const [title, setTitle] = useState("");

  return (
    <div className="space-y-4">
      <form
        action={async (form) => {
          await addTask(form);
          setTitle("");
        }}
        className="flex gap-2"
      >
        <input type="hidden" name="carId" value={carId} />
        <input type="hidden" name="projectId" value={projectId} />
        <Input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
        />
        <Button type="submit">Add</Button>
      </form>
      {tree.length === 0 ? (
        <p className="text-sm text-muted">Break the job into smaller tasks as it grows.</p>
      ) : (
        <ul className="space-y-1">{tree.map((node) => <TaskRow key={node.id} node={node} carId={carId} projectId={projectId} depth={0} />)}</ul>
      )}
    </div>
  );
}


// Task Row
// Represents a single task row in the tree. 
// Displays the task title, allows users to toggle the task status, update the title, add subtasks, and delete the task. 
// It also recursively renders any child tasks as nested rows.
function TaskRow({
  node,
  carId,
  projectId,
  depth,
}: {
  node: Node;
  carId: string;
  projectId: string;
  depth: number;
}) {
  const [adding, setAdding] = useState(false);
  const done = node.status === "done";

  return (
    <li>
      <div className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-surface-2" style={{ marginLeft: depth * 16 }}>
        <form action={toggleTask}>
          <input type="hidden" name="id" value={node.id} />
          <input type="hidden" name="carId" value={carId} />
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="status" value={node.status} />
          <button
            type="submit"
            className={cn(
              "h-4 w-4 rounded border",
              done ? "border-emerald-400 bg-emerald-400" : "border-muted",
            )}
            aria-label={done ? "Mark not done" : "Mark done"}
          />
        </form>
        <form action={updateTaskTitle} className="min-w-0 flex-1">
          <input type="hidden" name="id" value={node.id} />
          <input type="hidden" name="carId" value={carId} />
          <input type="hidden" name="projectId" value={projectId} />
          <input
            name="title"
            defaultValue={node.title}
            className={cn(
              "w-full bg-transparent text-sm outline-none",
              done && "text-muted line-through",
            )}
            onBlur={(e) => e.currentTarget.form?.requestSubmit()}
          />
        </form>
        <button type="button" className="text-xs text-muted hover:text-foreground" onClick={() => setAdding((v) => !v)}>
          Subtask
        </button>
        <form action={deleteTask}>
          <input type="hidden" name="id" value={node.id} />
          <input type="hidden" name="carId" value={carId} />
          <input type="hidden" name="projectId" value={projectId} />
          <button type="submit" className="text-xs text-muted hover:text-danger">
            Delete
          </button>
        </form>
      </div>
      {adding ? (
        <form
          action={async (form) => {
            await addTask(form);
            setAdding(false);
          }}
          className="mt-1 flex gap-2"
          style={{ marginLeft: (depth + 1) * 16 + 8 }}
        >
          <input type="hidden" name="carId" value={carId} />
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="parentTaskId" value={node.id} />
          <Input name="title" placeholder="Subtask…" autoFocus />
          <Button type="submit" variant="outline">
            Add
          </Button>
        </form>
      ) : null}
      {node.children.length > 0 ? (
        <ul>
          {node.children.map((child) => (
            <TaskRow key={child.id} node={child} carId={carId} projectId={projectId} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
