import Path from "path";
import discover from "./commands/discover.js";
import build from "./commands/build.js";
import CONSTANTS from "./constants.js";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "./parseArgsOptions.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

const args = new ParseArgs().loadOptions(parseArgsOptions).run();

class NPP {
    constructor() {
        this._records = {};
    }

    get records() {
        return this._records;
    }

    middleware(req, res, next) {
        this._records = {};
        discover(this._records);
        const url = req.originalUrl.substr(1);

        if (this._records[url]) {
            const record = this.records[url];
            if (record.type == CONSTANTS.TYPE.VIEW) {
                logger.channel("standard").log(`#view ${record.tagName}`);
                build(this._records);
                res.render(Path.join(record.dir.sub, record.view));
            }
        } else {            
            next();
        }
    }
}

export default NPP;
