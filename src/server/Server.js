import dotenv from "dotenv";
import Express from "express";
import http from "http";
import FS from "fs";
import Path from "path";
import { WidgetMiddleware } from "./WidgetMiddleware.js";
import CONST from "../constants.js";
import log, {logger, args} from "../setupLogger.js";

if (args.flags["env"]){
    dotenv.config();
}

class Server {
    async init () {
        log.verbose("Server Initialize");
        const wmw = new WidgetMiddleware();
        this.app = Express();

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

    async loadRoutes(path = CONST.LOCATIONS.ROUTES_DIR){
        if (!FS.existsSync(path)) return;
        
        const contents = FS.readdirSync(path).sort();

        for (const entry of contents) {
            const fullpath = Path.join(process.cwd(), path, entry);
            const { default: route } = await import(fullpath);
            this.app.use(route);
        }        
    }
}

export default Server;
