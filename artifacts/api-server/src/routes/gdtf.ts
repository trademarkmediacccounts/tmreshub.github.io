import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

let gdtfCache: any[] | null = null;
let gdtfCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60;

router.get("/gdtf/fixtures", requireAuth, async (req: any, res): Promise<void> => {
  const { search } = req.query;

  try {
    if (!gdtfCache || Date.now() - gdtfCacheTime > CACHE_TTL) {
      const response = await fetch("https://gdtf-share.com/apis/public/v1/getFixtures", {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`GDTF Share API returned ${response.status}`);
      const data = await response.json() as any;
      gdtfCache = Array.isArray(data) ? data : (data.fixtures ?? data.data ?? []);
      gdtfCacheTime = Date.now();
    }

    const cache = gdtfCache as any[];
    if (search && typeof search === "string" && search.trim().length > 0) {
      const term = search.toLowerCase().trim();
      const filtered = cache.filter((f: any) =>
        (f.manufacturer ?? "").toLowerCase().includes(term) ||
        (f.name ?? "").toLowerCase().includes(term)
      );
      res.json(filtered.slice(0, 60));
    } else {
      res.json(cache.slice(0, 60));
    }
  } catch (err: any) {
    res.status(502).json({ error: `GDTF Share unavailable: ${err.message}` });
  }
});

export default router;
