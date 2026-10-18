import { Router } from "express";
import { z } from "zod";

const router = Router();

type WorkItem = {
  id: number;
  title: string;
  description: string;
  status: "Open" | "In Progress" | "Awaiting Approval" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
};

const createWorkItemSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().max(2000).default(""),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
});

let nextId = 1;
const workItems: WorkItem[] = [];

router.get("/", (_req, res) => {
  res.json({
    items: workItems,
    total: workItems.length,
  });
});

router.post("/", (req, res) => {
  const result = createWorkItemSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid work item",
      details: result.error.issues,
    });
  }

  const item: WorkItem = {
    id: nextId++,
    title: result.data.title,
    description: result.data.description,
    priority: result.data.priority,
    status: "Open",
  };

  workItems.push(item);

  return res.status(201).json(item);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = workItems.find((workItem) => workItem.id === id);

  if (!item) {
    return res.status(404).json({ error: "Work item not found" });
  }

  return res.json(item);
});

export default router;
