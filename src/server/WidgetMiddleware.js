import Path from "path";
import discover from "../commands/discover.js";
import build from "../commands/build.js";
import CONSTANTS from "../constants.js";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";
import Logger from "@thaerious/logger";
import url from "url";
import settings from "../settings.js";
const logger = Logger.getLogger();

const args = new ParseArgs().loadOptions(parseArgsOptions).run();

class WidgetMiddleware {
    constructor () {
        this._records = {};
    }

    get records () {
        return this._records;
    }

    async middleware (req, res, next) {
        this._records = {};
        discover(this._records);
        const myurl = url.URL(req.url).pathname.substr(1);

        if (this._records[myurl]) {
            const record = this.records[myurl];
            if (record.type === CONSTANTS.TYPE.VIEW) {
                logger.channel(`standard`).log(`#view ${record.fullName}`);
                await build(this._records, null, args);

                const path = Path.join(record.dir.sub, record.view);
                const libFile = Path.join(settings[`output-dir`], CONSTANTS.FILENAME.LIB_FILE);
                const templateFile = Path.join(settings[`output-dir`], record.dir.sub, CONSTANTS.FILENAME.TEMPLATES);

                const data = {
                    prebuild: false,
                    lib_file: Path.resolve(libFile),
                    template_file: Path.resolve(templateFile)
                };

                res.render(path, data, (err, html) => {
                    if (err) {
                        logger.channel(`error`).log(`ERROR: view rendering`);
                        logger.channel(`error`).log(JSON.stringify(err, null, 2));
                        res.status(500);
                        res.send(err);
                    } else res.send(html);
                });
            }
        } else {
            next();
        }
    }
}

export { WidgetMiddleware };
