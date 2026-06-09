import { Router, type IRouter } from "express";
import healthRouter from "./health";
import assetsRouter from "./assets";
import gearRouter from "./gear";
import productionsRouter from "./productions";
import buildProjectsRouter from "./buildProjects";
import projectsRouter from "./projects";
import shotsRouter from "./shots";
import callSheetsRouter from "./callSheets";
import scriptBreakdownsRouter from "./scriptBreakdowns";
import projectAssetsRouter from "./projectAssets";
import leadsRouter from "./leads";
import stagingEnvironmentsRouter from "./stagingEnvironments";
import projectResourcesRouter from "./projectResources";

const router: IRouter = Router();

router.use(healthRouter);
router.use(assetsRouter);
router.use(gearRouter);
router.use(productionsRouter);
router.use(buildProjectsRouter);
router.use(projectsRouter);
router.use(shotsRouter);
router.use(callSheetsRouter);
router.use(scriptBreakdownsRouter);
router.use(projectAssetsRouter);
router.use(leadsRouter);
router.use(stagingEnvironmentsRouter);
router.use(projectResourcesRouter);

export default router;
