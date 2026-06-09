import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, asc } from "drizzle-orm";
import { db, scriptBreakdownsTable } from "@workspace/db";
import {
  ListScriptBreakdownsParams,
  CreateScriptBreakdownParams,
  CreateScriptBreakdownBody,
  UpdateScriptBreakdownParams,
  UpdateScriptBreakdownBody,
  DeleteScriptBreakdownParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/projects/:projectId/script-breakdowns", requireAuth, async (req: any, res): Promise<void> => {
  const params = ListScriptBreakdownsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const items = await db.select().from(scriptBreakdownsTable)
    .where(and(eq(scriptBreakdownsTable.projectId, params.data.projectId), eq(scriptBreakdownsTable.userId, req.userId)))
    .orderBy(asc(scriptBreakdownsTable.elementType));
  res.json(items);
});

router.post("/projects/:projectId/script-breakdowns", requireAuth, async (req: any, res): Promise<void> => {
  const params = CreateScriptBreakdownParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = CreateScriptBreakdownBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(scriptBreakdownsTable).values({ ...parsed.data, projectId: params.data.projectId, userId: req.userId }).returning();
  res.status(201).json(item);
});

router.patch("/script-breakdowns/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = UpdateScriptBreakdownParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateScriptBreakdownBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.update(scriptBreakdownsTable).set(parsed.data)
    .where(and(eq(scriptBreakdownsTable.id, params.data.id), eq(scriptBreakdownsTable.userId, req.userId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/script-breakdowns/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteScriptBreakdownParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(scriptBreakdownsTable).where(and(eq(scriptBreakdownsTable.id, params.data.id), eq(scriptBreakdownsTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
