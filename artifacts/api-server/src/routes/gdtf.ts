import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = auth.userId;
  next();
};

let gdtfCache: any[] | null = null;
let gdtfCacheTime = 0;
let gdtfUnavailableUntil = 0;
const CACHE_TTL = 1000 * 60 * 60;       // 1 h for successful data
const UNAVAIL_TTL = 1000 * 60 * 10;    // 10 min back-off on failure

const GDTF_ENDPOINTS = [
  "https://gdtf-share.com/apis/public/v1/getFixtures",
  "https://gdtf-share.com/apis/public/v1/fixtures",
];

router.get("/gdtf/fixtures", requireAuth, async (req: any, res): Promise<void> => {
  const { search } = req.query;

  // If we know the API is down, return empty immediately
  if (!gdtfCache && Date.now() < gdtfUnavailableUntil) {
    res.status(503).json({ error: "GDTF Share API is currently unavailable", fixtures: [] });
    return;
  }

  try {
    if (!gdtfCache || Date.now() - gdtfCacheTime > CACHE_TTL) {
      let data: any = null;
      for (const url of GDTF_ENDPOINTS) {
        try {
          const response = await fetch(url, {
            headers: { "Accept": "application/json", "User-Agent": "TMHub/1.0" },
            signal: AbortSignal.timeout(8000),
          });
          if (response.ok) {
            data = await response.json();
            break;
          }
        } catch {
          // try next endpoint
        }
      }

      if (!data) {
        gdtfUnavailableUntil = Date.now() + UNAVAIL_TTL;
        res.status(503).json({ error: "GDTF Share API is currently unavailable", fixtures: [] });
        return;
      }

      gdtfCache = Array.isArray(data) ? data : (data.fixtures ?? data.data ?? []);
      gdtfCacheTime = Date.now();
      gdtfUnavailableUntil = 0;
    }

    const cache = gdtfCache as any[];
    if (search && typeof search === "string" && search.trim().length >= 2) {
      const term = search.toLowerCase().trim();
      // Search across all string values in the fixture object regardless of field names
      const filtered = cache.filter((f: any) =>
        Object.values(f).some(v => typeof v === "string" && v.toLowerCase().includes(term))
      );
      res.json(filtered.slice(0, 60));
    } else {
      res.json(cache.slice(0, 60));
    }
  } catch (err: any) {
    gdtfUnavailableUntil = Date.now() + UNAVAIL_TTL;
    res.status(503).json({ error: `GDTF Share unavailable: ${err.message}` });
  }
});

export default router;
