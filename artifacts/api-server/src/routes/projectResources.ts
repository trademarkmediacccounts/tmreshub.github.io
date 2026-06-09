import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, desc } from "drizzle-orm";
import { db, projectResourcesTable } from "@workspace/db";
import {
  ListProjectResourcesParams,
  CreateProjectResourceParams,
  CreateProjectResourceBody,
  UpdateProjectResourceParams,
  UpdateProjectResourceBody,
  DeleteProjectResourceParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/projects/:projectId/resources", requireAuth, async (req: any, res): Promise<void> => {
  const params = ListProjectResourcesParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const items = await db.select().from(projectResourcesTable)
    .where(and(eq(projectResourcesTable.projectId, params.data.projectId), eq(projectResourcesTable.userId, req.userId)))
    .orderBy(desc(projectResourcesTable.createdAt));
  res.json(items);
});

router.post("/projects/:projectId/resources", requireAuth, async (req: any, res): Promise<void> => {
  const params = CreateProjectResourceParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = CreateProjectResourceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(projectResourcesTable).values({ ...parsed.data, projectId: params.data.projectId, userId: req.userId }).returning();
  res.status(201).json(item);
});

router.patch("/project-resources/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = UpdateProjectResourceParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateProjectResourceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.update(projectResourcesTable).set(parsed.data)
    .where(and(eq(projectResourcesTable.id, params.data.id), eq(projectResourcesTable.userId, req.userId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/project-resources/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteProjectResourceParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(projectResourcesTable).where(and(eq(projectResourcesTable.id, params.data.id), eq(projectResourcesTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
