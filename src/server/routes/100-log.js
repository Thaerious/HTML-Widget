import express from "express";
import Logger from "@thaerious/logger";

const router = express.Router();
const logger = Logger.getLogger();

router.use(`*`, (req, res, next) => {
    logger.channel(`server`).log(req.method + ` ` + req.originalUrl);
    next();
});

export default router;