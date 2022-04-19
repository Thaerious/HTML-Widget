import Path from "path";
import discover from "../commands/discover.js";
import build from "../commands/build.js";
import CONSTANTS from "../constants.js";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";
import Logger from "@thaerious/logger";
import url from "url";
import settings from "../settings.js";
import { constants } from "buffer";
const logger = Logger.getLogger();

const args = new ParseArgs().loadOptions(parseArgsOptions).run();

class WidgetMiddleware {
    constructor() {
        this._records = {};
    }

    get records() {
        return this._records;
    }

    middleware(req, res, next) {
        this._records = {};
        discover(this._records);
        const myurl = url.parse(req.url).pathname.substr(1);

        if (this._records[myurl]) {
            const record = this.records[myurl];
            if (record.type == CONSTANTS.TYPE.VIEW) {
                logger.channel("standard").log(`#view ${record.fullName}`);
                build(this._records);

                const path = Path.join(record.dir.sub, record.view);
                const lib_file = Path.join(settings['output-dir'], CONSTANTS.FILENAME.LIB_FILE);
                const template_file = Path.join(settings['output-dir'], record.dir.sub, CONSTANTS.FILENAME.TEMPLATES);

                const data = {
                    prebuild : false,
                    lib_file : Path.resolve(lib_file),
                    template_file : Path.resolve(template_file)
                };

                res.render(path, data, (err, html)=>{
                    if (err) res.send(err);
                    else res.send(html)
                });
            }
        } else {            
            next();
        }
    }
}

export default WidgetMiddleware;
