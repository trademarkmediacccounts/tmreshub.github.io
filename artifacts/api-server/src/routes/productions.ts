import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, desc } from "drizzle-orm";
import { db, productionsTable } from "@workspace/db";
import { CreateProductionBody, DeleteProductionParams } from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/productions", requireAuth, async (req: any, res): Promise<void> => {
  const items = await db.select().from(productionsTable)
    .where(eq(productionsTable.userId, req.userId))
    .orderBy(desc(productionsTable.createdAt));
  res.json(items);
});

router.post("/productions", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateProductionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(productionsTable).values({ ...parsed.data, userId: req.userId }).returning();
  res.status(201).json(item);
});

router.delete("/productions/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteProductionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(productionsTable).where(and(eq(productionsTable.id, params.data.id), eq(productionsTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
