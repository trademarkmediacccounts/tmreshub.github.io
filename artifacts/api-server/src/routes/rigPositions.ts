import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, asc } from "drizzle-orm";
import { db, rigPositionsTable } from "@workspace/db";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/projects/:projectId/rig-positions", requireAuth, async (req: any, res): Promise<void> => {
  const { projectId } = req.params;
  const items = await db.select().from(rigPositionsTable)
    .where(and(eq(rigPositionsTable.projectId, projectId), eq(rigPositionsTable.userId, req.userId)))
    .orderBy(asc(rigPositionsTable.sortOrder));
  res.json(items);
});

router.post("/projects/:projectId/rig-positions", requireAuth, async (req: any, res): Promise<void> => {
  const { projectId } = req.params;
  const { name, positionType, xPos, yPos, widthPx, heightPx, color, notes, sortOrder } = req.body;
  if (!name) { res.status(400).json({ error: "name is required" }); return; }
  const [item] = await db.insert(rigPositionsTable).values({
    projectId, userId: req.userId, name,
    positionType: positionType ?? "Truss",
    xPos: xPos != null ? Number(xPos) : 0,
    yPos: yPos != null ? Number(yPos) : 0,
    widthPx: widthPx != null ? Number(widthPx) : 200,
    heightPx: heightPx != null ? Number(heightPx) : 8,
    color: color ?? "#333333",
    notes: notes ?? null,
    sortOrder: sortOrder != null ? Number(sortOrder) : 0,
  }).returning();
  res.status(201).json(item);
});

router.patch("/rig-positions/:id", requireAuth, async (req: any, res): Promise<void> => {
  const { id } = req.params;
  const body = req.body;
  const updates: Record<string, any> = {};
  const fields = ["name", "positionType", "xPos", "yPos", "widthPx", "heightPx", "color", "notes", "sortOrder"];
  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f];
  }
  const [item] = await db.update(rigPositionsTable).set(updates)
    .where(and(eq(rigPositionsTable.id, id), eq(rigPositionsTable.userId, req.userId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/rig-positions/:id", requireAuth, async (req: any, res): Promise<void> => {
  const { id } = req.params;
  await db.delete(rigPositionsTable).where(and(eq(rigPositionsTable.id, id), eq(rigPositionsTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
