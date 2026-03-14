import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import problemsRouter from "./problems.js";
import submissionsRouter from "./submissions.js";
import leaderboardRouter from "./leaderboard.js";
import usersRouter from "./users.js";
import gamificationRouter from "./gamification.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/problems", problemsRouter);
router.use("/submissions", submissionsRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/users", usersRouter);
router.use("/gamification", gamificationRouter);

export default router;
