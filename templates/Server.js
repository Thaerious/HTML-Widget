import Express from "express";
import http from "http";
import FS from "fs";
import Path from "path";
import { StaticMiddleware } from "@html-widget/core";
import Logger from "@thaerious/logger";

const logger = Logger.getLogger();
const log = logger.all("server");

class Server {
    async init () {
        const wmw = new StaticMiddleware();
        this.app = Express();

        this.app.use(`*`, (req, res, next) => {
            log.server(`${req.method} ${req.originalUrl}`);
            next();
        });

        this.app.set(`views`, `www/linked`);
        this.app.set(`view engine`, `ejs`);
        this.app.use((req, res, next) => wmw.middleware(req, res, next));

        await this.loadRoutes();

        this.app.use(Express.static(`www/static`));
        this.app.use(Express.static(`www/compiled`));
        this.app.use(Express.static(`www/linked`));

        this.app.use(`*`, (req, res) => {
            log.server(`404 ${req.originalUrl}`);
            res.statusMessage = `404 Page Not Found: ${req.originalUrl}`;
            res.status(404);
            res.send(`404: page not found`);
            res.end();
        });

        return this;
    }

    start (port = 8000, ip = `0.0.0.0`) {
        this.server = http.createServer(this.app);
        this.server.listen(port, ip, () => {
            log.server(`Listening on port ${port}`);
        });

        process.on(`SIGINT`, () => this.stop(this.server));
        process.on(`SIGTERM`, () => this.stop(this.server));
        return this;
    }

    stop () {
        log.server(`Stopping server`);
        this.server.close();
        process.exit();
    }

    async loadRoutes(path = "server-src/routes"){
        if (!FS.existsSync(path)) return;
        
        const contents = FS.readdirSync(path);
        for (const entry of contents){            
            const fullpath = Path.join(process.cwd(), path, entry);
            const { default: route } = await import(fullpath);
            this.app.use(route);
        }        
    }
}

const server = new Server();
await server.init();
server.start();

export default Server;
