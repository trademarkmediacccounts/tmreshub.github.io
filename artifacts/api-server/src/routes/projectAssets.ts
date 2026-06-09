import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, desc } from "drizzle-orm";
import { db, projectAssetsTable } from "@workspace/db";
import {
  ListProjectAssetsParams,
  CreateProjectAssetParams,
  CreateProjectAssetBody,
  DeleteProjectAssetParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/projects/:projectId/project-assets", requireAuth, async (req: any, res): Promise<void> => {
  const params = ListProjectAssetsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const items = await db.select().from(projectAssetsTable)
    .where(and(eq(projectAssetsTable.projectId, params.data.projectId), eq(projectAssetsTable.userId, req.userId)))
    .orderBy(desc(projectAssetsTable.createdAt));
  res.json(items);
});

router.post("/projects/:projectId/project-assets", requireAuth, async (req: any, res): Promise<void> => {
  const params = CreateProjectAssetParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = CreateProjectAssetBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(projectAssetsTable).values({ ...parsed.data, projectId: params.data.projectId, userId: req.userId }).returning();
  res.status(201).json(item);
});

router.delete("/project-assets/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteProjectAssetParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(projectAssetsTable).where(and(eq(projectAssetsTable.id, params.data.id), eq(projectAssetsTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
