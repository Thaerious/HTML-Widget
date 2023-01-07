import express from "express";
import { WidgetMiddleware } from "../WidgetMiddleware.js";

const router = express.Router();
const wmw = new WidgetMiddleware();

router.use((req, res, next) => wmw.middleware(req, res, next));

export default router;