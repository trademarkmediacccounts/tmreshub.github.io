import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, desc } from "drizzle-orm";
import { db, gearItemsTable } from "@workspace/db";
import {
  CreateGearItemBody,
  UpdateGearItemParams,
  UpdateGearItemBody,
  DeleteGearItemParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/gear", requireAuth, async (req: any, res): Promise<void> => {
  const items = await db.select().from(gearItemsTable)
    .where(eq(gearItemsTable.userId, req.userId))
    .orderBy(desc(gearItemsTable.createdAt));
  res.json(items);
});

router.post("/gear", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateGearItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(gearItemsTable).values({ ...parsed.data, userId: req.userId }).returning();
  res.status(201).json(item);
});

router.patch("/gear/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = UpdateGearItemParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateGearItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.update(gearItemsTable).set(parsed.data)
    .where(and(eq(gearItemsTable.id, params.data.id), eq(gearItemsTable.userId, req.userId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/gear/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteGearItemParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(gearItemsTable).where(and(eq(gearItemsTable.id, params.data.id), eq(gearItemsTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
