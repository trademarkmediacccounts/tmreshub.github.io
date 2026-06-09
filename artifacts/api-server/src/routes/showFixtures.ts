import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq, and, asc } from "drizzle-orm";
import { db, showFixturesTable } from "@workspace/db";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/fixtures", requireAuth, async (req: any, res): Promise<void> => {
  const items = await db.select().from(showFixturesTable)
    .where(eq(showFixturesTable.userId, req.userId))
    .orderBy(asc(showFixturesTable.manufacturer), asc(showFixturesTable.model));
  res.json(items);
});

router.post("/fixtures", requireAuth, async (req: any, res): Promise<void> => {
  const { manufacturer, model, mode, dmxFootprint, beamAngle, colorTemp, power, weight, gdtfManufacturer, gdtfName, gdtfRuid, notes } = req.body;
  if (!manufacturer || !model) { res.status(400).json({ error: "manufacturer and model are required" }); return; }
  const [item] = await db.insert(showFixturesTable).values({
    userId: req.userId, manufacturer, model,
    mode: mode ?? null, dmxFootprint: dmxFootprint != null ? Number(dmxFootprint) : null,
    beamAngle: beamAngle ?? null, colorTemp: colorTemp ?? null, power: power ?? null,
    weight: weight ?? null, gdtfManufacturer: gdtfManufacturer ?? null,
    gdtfName: gdtfName ?? null, gdtfRuid: gdtfRuid ?? null, notes: notes ?? null,
  }).returning();
  res.status(201).json(item);
});

router.patch("/fixtures/:id", requireAuth, async (req: any, res): Promise<void> => {
  const { id } = req.params;
  if (!id) { res.status(400).json({ error: "id required" }); return; }
  const { manufacturer, model, mode, dmxFootprint, beamAngle, colorTemp, power, weight, gdtfManufacturer, gdtfName, gdtfRuid, notes } = req.body;
  const updates: Record<string, any> = {};
  if (manufacturer !== undefined) updates.manufacturer = manufacturer;
  if (model !== undefined) updates.model = model;
  if (mode !== undefined) updates.mode = mode;
  if (dmxFootprint !== undefined) updates.dmxFootprint = dmxFootprint != null ? Number(dmxFootprint) : null;
  if (beamAngle !== undefined) updates.beamAngle = beamAngle;
  if (colorTemp !== undefined) updates.colorTemp = colorTemp;
  if (power !== undefined) updates.power = power;
  if (weight !== undefined) updates.weight = weight;
  if (gdtfManufacturer !== undefined) updates.gdtfManufacturer = gdtfManufacturer;
  if (gdtfName !== undefined) updates.gdtfName = gdtfName;
  if (gdtfRuid !== undefined) updates.gdtfRuid = gdtfRuid;
  if (notes !== undefined) updates.notes = notes;
  const [item] = await db.update(showFixturesTable).set(updates)
    .where(and(eq(showFixturesTable.id, id), eq(showFixturesTable.userId, req.userId))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/fixtures/:id", requireAuth, async (req: any, res): Promise<void> => {
  const { id } = req.params;
  if (!id) { res.status(400).json({ error: "id required" }); return; }
  await db.delete(showFixturesTable).where(and(eq(showFixturesTable.id, id), eq(showFixturesTable.userId, req.userId)));
  res.sendStatus(204);
});

export default router;
