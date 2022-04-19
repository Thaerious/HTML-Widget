#!/usr/bin/env node

import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";
const args = new ParseArgs().loadOptions(parseArgsOptions).run();
if (args.flags.cwd) process.chdir(args.flags.cwd);

import Express from "express";
import http from "http";
import WidgetMiddleware from "./WidgetMiddleware.js";
import Logger from "@thaerious/logger";

const logger = Logger.getLogger();
logger.channel(`standard`).enabled = true;
logger.channel(`verbose`).enabled = false;
logger.channel(`very-verbose`).enabled = false;
logger.channel(`debug`).enabled = false;
logger.channel(`warning`).enabled = true;
logger.channel(`error`).enabled = true;

logger.channel(`warning`).prefix = (f, l, o) => `* WARNING `;

(() => {
    const npp = new WidgetMiddleware();
    const app = Express();

    app.use(`*`, (req, res, next) => {
        logger.channel(`server`).log(`${req.method} ${req.originalUrl}`);
        next();
    });

    app.set("views", "www/linked");
    app.set("view engine", "ejs");
    app.use((req, res, next) => npp.middleware(req, res, next));

    app.use(Express.static("www/compiled"));
    app.use(Express.static("www/linked"));
    app.use(Express.static("www/public"));

    app.use(`*`, (req, res) => {
        logger.channel(`server`).log(`404 ${req.originalUrl}`);
        res.statusMessage = `404 Page Not Found: ${req.originalUrl}`;
        res.status(404);
        res.send(`404: page not found`);
        res.end();
    });

    const server = http.createServer(app);
    server.listen(8000, "0.0.0.0", () => {
        logger.channel(`server`).log(`Listening on port 8000`);
    });

    process.on(`SIGINT`, () => stop(server));
    process.on(`SIGTERM`, () => stop(server));
})();

function stop(server) {
    logger.channel(`server`).log(`Stopping server`);
    server.close();
    process.exit();
}
