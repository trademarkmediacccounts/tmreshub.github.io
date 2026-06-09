import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, desc } from "drizzle-orm";
import { db, buildProjectsTable } from "@workspace/db";
import {
  CreateBuildProjectBody,
  UpdateBuildProjectParams,
  UpdateBuildProjectBody,
  DeleteBuildProjectParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/build-projects", requireAuth, async (req: any, res): Promise<void> => {
  const items = await db.select().from(buildProjectsTable)
    .where(eq(buildProjectsTable.userId, req.userId))
    .orderBy(desc(buildProjectsTable.createdAt));
  res.json(items);
});

router.post("/build-projects", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateBuildProjectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(buildProjectsTable).values({ ...parsed.data, userId: req.userId }).returning();
  res.status(201).json(item);
});

router.patch("/build-projects/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = UpdateBuildProjectParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateBuildProjectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.update(buildProjectsTable).set(parsed.data)
    .where(and(eq(buildProjectsTable.id, params.data.id), eq(buildProjectsTable.userId, req.userId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/build-projects/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteBuildProjectParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(buildProjectsTable).where(and(eq(buildProjectsTable.id, params.data.id), eq(buildProjectsTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
