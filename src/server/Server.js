import dotenv from "dotenv";
import Express from "express";
import http from "http";
import FS from "fs";
import Path from "path";
import CONST from "../constants.js";
import log, {logger, args} from "../setupLogger.js";

if (args.flags["env"]){
    dotenv.config();
}

class Server {
    async init () {
        log.verbose("Initialize Server");        
        this.app = Express();

        this.app.set(`views`, `www/linked`);
        this.app.set(`view engine`, `ejs`);

        await this.loadRoutes();
        return this;
    }

    start(port = 8000, ip = `0.0.0.0`) {
        port = parseInt(port);
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
