import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, asc } from "drizzle-orm";
import { db, patchItemsTable } from "@workspace/db";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/projects/:projectId/patch", requireAuth, async (req: any, res): Promise<void> => {
  const { projectId } = req.params;
  const items = await db.select().from(patchItemsTable)
    .where(and(eq(patchItemsTable.projectId, projectId), eq(patchItemsTable.userId, req.userId)))
    .orderBy(asc(patchItemsTable.dmxUniverse), asc(patchItemsTable.dmxAddress));
  res.json(items);
});

router.post("/projects/:projectId/patch", requireAuth, async (req: any, res): Promise<void> => {
  const { projectId } = req.params;
  const { fixtureName, manufacturer, dmxUniverse, dmxAddress, circuit, dimmerNumber, gelColor, purpose, position, notes, sortOrder } = req.body;
  if (!fixtureName) { res.status(400).json({ error: "fixtureName is required" }); return; }
  if (dmxAddress == null) { res.status(400).json({ error: "dmxAddress is required" }); return; }
  const [item] = await db.insert(patchItemsTable).values({
    projectId, userId: req.userId, fixtureName,
    manufacturer: manufacturer ?? null,
    dmxUniverse: dmxUniverse != null ? Number(dmxUniverse) : 1,
    dmxAddress: Number(dmxAddress),
    circuit: circuit ?? null, dimmerNumber: dimmerNumber ?? null,
    gelColor: gelColor ?? null, purpose: purpose ?? null,
    position: position ?? null, notes: notes ?? null,
    sortOrder: sortOrder != null ? Number(sortOrder) : 0,
  }).returning();
  res.status(201).json(item);
});

router.patch("/patch/:id", requireAuth, async (req: any, res): Promise<void> => {
  const { id } = req.params;
  const body = req.body;
  const updates: Record<string, any> = {};
  const fields = ["fixtureName", "manufacturer", "dmxUniverse", "dmxAddress", "circuit", "dimmerNumber", "gelColor", "purpose", "position", "notes", "sortOrder"];
  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f];
  }
  const [item] = await db.update(patchItemsTable).set(updates)
    .where(and(eq(patchItemsTable.id, id), eq(patchItemsTable.userId, req.userId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/patch/:id", requireAuth, async (req: any, res): Promise<void> => {
  const { id } = req.params;
  await db.delete(patchItemsTable).where(and(eq(patchItemsTable.id, id), eq(patchItemsTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
