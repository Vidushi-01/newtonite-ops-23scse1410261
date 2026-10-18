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

router.get("/", (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(req.query.limit) || 10)
  );

  const startIndex = (page - 1) * limit;
  const items = workItems.slice(startIndex, startIndex + limit);

  return res.json({
    items,
    pagination: {
      page,
      limit,
      total: workItems.length,
      totalPages: Math.ceil(workItems.length / limit),
    },
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
const updateWorkItemSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum([
    "Open",
    "In Progress",
    "Awaiting Approval",
    "Resolved",
    "Closed",
  ]).optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Provide at least one field to update",
});
const allowedTransitions: Record<
  WorkItem["status"],
  WorkItem["status"][]
> = {
  "Open": ["In Progress"],
  "In Progress": ["Open", "Awaiting Approval"],
  "Awaiting Approval": ["In Progress", "Resolved"],
  "Resolved": ["Closed", "In Progress"],
  "Closed": [],
};

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = workItems.find((workItem) => workItem.id === id);

  if (!item) {
    return res.status(404).json({ error: "Work item not found" });
  }

  const result = updateWorkItemSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid update",
      details: result.error.issues,
    });
  }

  const requestedStatus = result.data.status;

if (
  requestedStatus &&
  requestedStatus !== item.status &&
  !allowedTransitions[item.status].includes(requestedStatus)
) {
  return res.status(400).json({
    error: `Cannot change status from ${item.status} to ${requestedStatus}`,
  });
}

Object.assign(item, result.data);

  return res.json(item);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = workItems.findIndex((workItem) => workItem.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Work item not found" });
  }

  workItems.splice(index, 1);

  return res.status(204).send();
});

export default router;
