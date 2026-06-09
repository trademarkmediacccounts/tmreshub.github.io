import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, asc } from "drizzle-orm";
import { db, callSheetsTable, callSheetEntriesTable } from "@workspace/db";
import {
  ListCallSheetsParams,
  CreateCallSheetParams,
  CreateCallSheetBody,
  DeleteCallSheetParams,
  ListCallSheetEntriesParams,
  CreateCallSheetEntryParams,
  CreateCallSheetEntryBody,
  DeleteCallSheetEntryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/projects/:projectId/call-sheets", requireAuth, async (req: any, res): Promise<void> => {
  const params = ListCallSheetsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const items = await db.select().from(callSheetsTable)
    .where(and(eq(callSheetsTable.projectId, params.data.projectId), eq(callSheetsTable.userId, req.userId)))
    .orderBy(asc(callSheetsTable.shootDate));
  res.json(items);
});

router.post("/projects/:projectId/call-sheets", requireAuth, async (req: any, res): Promise<void> => {
  const params = CreateCallSheetParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = CreateCallSheetBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(callSheetsTable).values({ ...parsed.data, projectId: params.data.projectId, userId: req.userId }).returning();
  res.status(201).json(item);
});

router.delete("/call-sheets/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteCallSheetParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(callSheetsTable).where(and(eq(callSheetsTable.id, params.data.id), eq(callSheetsTable.userId, req.userId)));
  res.sendStatus(204);
});

router.get("/call-sheets/:callSheetId/entries", requireAuth, async (req: any, res): Promise<void> => {
  const params = ListCallSheetEntriesParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const items = await db.select().from(callSheetEntriesTable)
    .where(and(eq(callSheetEntriesTable.callSheetId, params.data.callSheetId), eq(callSheetEntriesTable.userId, req.userId)))
    .orderBy(asc(callSheetEntriesTable.callTime));
  res.json(items);
});

router.post("/call-sheets/:callSheetId/entries", requireAuth, async (req: any, res): Promise<void> => {
  const params = CreateCallSheetEntryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = CreateCallSheetEntryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(callSheetEntriesTable).values({ ...parsed.data, callSheetId: params.data.callSheetId, userId: req.userId }).returning();
  res.status(201).json(item);
});

router.delete("/call-sheet-entries/:id", requireAuth, async (req: any, res): Promise<void> => {
  const params = DeleteCallSheetEntryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(callSheetEntriesTable).where(and(eq(callSheetEntriesTable.id, params.data.id), eq(callSheetEntriesTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
