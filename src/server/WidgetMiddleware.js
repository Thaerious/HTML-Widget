import Path from "path";
import discover from "../commands/discover.js";
import build from "../commands/build.js";
import CONSTANTS from "../constants.js";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";
import logger from "../setupLogger.js";
import settings from "../settings.js";

const args = new ParseArgs().loadOptions(parseArgsOptions).run();

class WidgetMiddleware {
    constructor() {
        this._records = {};
    }

    get records() {
        return this._records;
    }

    async render(recordName, dataIn, cb) {
        if (!this._records[recordName]) return false;

        const record = this.records[recordName];
        if (record.type === CONSTANTS.TYPE.VIEW) {
            logger.standard(`#view ${record.fullName}`);
            await build(this._records, null, args);

            const path = Path.join(record.dir.sub, record.view);
            const libFile = Path.join(settings[`output-dir`], CONSTANTS.FILENAME.LIB_FILE);
            const templateFile = Path.join(settings[`output-dir`], record.dir.sub, CONSTANTS.FILENAME.TEMPLATES);

            const data = {
                prebuild: false,
                lib_file: Path.resolve(libFile),
                template_file: Path.resolve(templateFile),
                ...dataIn,
            };

            res.render(path, data, (err, html) => {
                cb(err, html);
            });
        }
        return true;
    }

    async middleware(req, res, next) {
        this._records = {};
        discover(this._records);

        let myurl = req.originalUrl;
        if (myurl.endsWith("/")) myurl = myurl.substring(0, myurl.length - 1);
        if (myurl.startsWith("/")) myurl = myurl.substring(1);

        if (this._records[myurl]) {
            this.render(myurl, {}, (err, html) => {
                if (err) {
                    logger.error(`ERROR: view rendering`);
                    logger.error(JSON.stringify(err, null, 2));
                    res.status(500);
                    res.send(err);
                } else res.send(html);
            });
        } else {
            next();
        }
    }
}

export { WidgetMiddleware };
