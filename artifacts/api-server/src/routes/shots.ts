import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, asc } from "drizzle-orm";
import { db, shotsTable } from "@workspace/db";
import {
  ListShotsParams,
  CreateShotParams,
  CreateShotBody,
  UpdateShotParams,
  UpdateShotBody,
  DeleteShotParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/projects/:projectId/shots", requireAuth, async (req: any, res): Promise<void> => {
  const params = ListShotsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const items = await db.select().from(shotsTable)
    .where(and(eq(shotsTable.projectId, params.data.projectId), eq(shotsTable.userId, req.userId)))
    .orderBy(asc(shotsTable.sortOrder));
  res.json(items);
});

router.post("/projects/:projectId/shots", requireAuth, async (req: any, res): Promise<void> => {
  const params = CreateShotParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = CreateShotBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(shotsTable).values({ ...parsed.data, projectId: params.data.projectId, userId: req.userId }).returning();
  res.status(201).json(item);
});

router.patch("/shots/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = UpdateShotParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateShotBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.update(shotsTable).set(parsed.data)
    .where(and(eq(shotsTable.id, params.data.id), eq(shotsTable.userId, req.userId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/shots/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteShotParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(shotsTable).where(and(eq(shotsTable.id, params.data.id), eq(shotsTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
