import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, desc } from "drizzle-orm";
import { db, leadsTable } from "@workspace/db";
import {
  CreateLeadBody,
  UpdateLeadParams,
  UpdateLeadBody,
  DeleteLeadParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/leads", requireAuth, async (req: any, res): Promise<void> => {
  const items = await db.select().from(leadsTable)
    .where(eq(leadsTable.userId, req.userId))
    .orderBy(desc(leadsTable.createdAt));
  res.json(items);
});

router.post("/leads", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(leadsTable).values({ ...parsed.data, userId: req.userId }).returning();
  res.status(201).json(item);
});

router.patch("/leads/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = UpdateLeadParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateLeadBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.update(leadsTable).set(parsed.data)
    .where(and(eq(leadsTable.id, params.data.id), eq(leadsTable.userId, req.userId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/leads/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteLeadParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(leadsTable).where(and(eq(leadsTable.id, params.data.id), eq(leadsTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
