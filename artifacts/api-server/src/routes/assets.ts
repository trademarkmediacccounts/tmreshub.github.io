import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, desc } from "drizzle-orm";
import { db, assetsTable } from "@workspace/db";
import {
  CreateAssetBody,
  UpdateAssetParams,
  UpdateAssetBody,
  DeleteAssetParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/assets", requireAuth, async (req: any, res): Promise<void> => {
  const assets = await db.select().from(assetsTable)
    .where(eq(assetsTable.userId, req.userId))
    .orderBy(desc(assetsTable.createdAt));
  res.json(assets);
});

router.post("/assets", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateAssetBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [asset] = await db.insert(assetsTable).values({ ...parsed.data, userId: req.userId }).returning();
  res.status(201).json(asset);
});

router.patch("/assets/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = UpdateAssetParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateAssetBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [asset] = await db.update(assetsTable).set(parsed.data)
    .where(and(eq(assetsTable.id, params.data.id), eq(assetsTable.userId, req.userId))).returning();
  if (!asset) { res.status(404).json({ error: "Not found" }); return; }
  res.json(asset);
});

router.delete("/assets/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteAssetParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(assetsTable).where(and(eq(assetsTable.id, params.data.id), eq(assetsTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
