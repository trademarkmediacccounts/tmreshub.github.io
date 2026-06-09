import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, desc } from "drizzle-orm";
import { db, stagingEnvironmentsTable } from "@workspace/db";
import {
  ListStagingEnvironmentsParams,
  CreateStagingEnvironmentParams,
  CreateStagingEnvironmentBody,
  UpdateStagingEnvironmentParams,
  UpdateStagingEnvironmentBody,
  DeleteStagingEnvironmentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/projects/:projectId/staging-environments", requireAuth, async (req: any, res): Promise<void> => {
  const params = ListStagingEnvironmentsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const items = await db.select().from(stagingEnvironmentsTable)
    .where(and(eq(stagingEnvironmentsTable.projectId, params.data.projectId), eq(stagingEnvironmentsTable.userId, req.userId)))
    .orderBy(desc(stagingEnvironmentsTable.createdAt));
  res.json(items);
});

router.post("/projects/:projectId/staging-environments", requireAuth, async (req: any, res): Promise<void> => {
  const params = CreateStagingEnvironmentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = CreateStagingEnvironmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(stagingEnvironmentsTable).values({ ...parsed.data, projectId: params.data.projectId, userId: req.userId }).returning();
  res.status(201).json(item);
});

router.patch("/staging-environments/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = UpdateStagingEnvironmentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateStagingEnvironmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.update(stagingEnvironmentsTable).set(parsed.data as any)
    .where(and(eq(stagingEnvironmentsTable.id, params.data.id), eq(stagingEnvironmentsTable.userId, req.userId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/staging-environments/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteStagingEnvironmentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(stagingEnvironmentsTable).where(and(eq(stagingEnvironmentsTable.id, params.data.id), eq(stagingEnvironmentsTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
