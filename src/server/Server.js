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

class Server{

    constructor(){
        const wmw = new WidgetMiddleware();
        this.app = Express();

        this.app.use(`*`, (req, res, next) => {
            logger.channel(`this.server`).log(`${req.method} ${req.originalUrl}`);
            next();
        });

        this.app.set("views", "www/linked");
        this.app.set("view engine", "ejs");
        this.app.use((req, res, next) => wmw.middleware(req, res, next));
    
        this.app.use(Express.static("www/static"));
        this.app.use(Express.static("www/compiled"));
        this.app.use(Express.static("www/linked"));
    
        this.app.use(`*`, (req, res) => {
            logger.channel(`this.server`).log(`404 ${req.originalUrl}`);
            res.statusMessage = `404 Page Not Found: ${req.originalUrl}`;
            res.status(404);
            res.send(`404: page not found`);
            res.end();
        });        
    }

    start(port = 8000, ip = "0.0.0.0"){
        this.server = http.createServer(this.app);
        this.server.listen(port, ip, () => {
            logger.channel(`this.server`).log(`Listening on port ${port}`);
        });
    
        process.on(`SIGINT`, () => stop(this.server));
        process.on(`SIGTERM`, () => stop(this.server));
        return this;        
    }

    stop(){
        logger.channel(`this.server`).log(`Stopping this.server`);
        this.server.close();
        process.exit();
    }

}

export default Server;