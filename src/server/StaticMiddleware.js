import Path from "path";
import discover from "../commands/discover.js";
import build from "../commands/build.js";
import CONST from "../constants.js";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";
import settings from "../settings.js";

const args = new ParseArgs().loadOptions(parseArgsOptions).run();

class StaticMiddleware {
    constructor() {
        this._records = {};
    }

    get records() {
        return this._records;
    }

    /**
     * Create the HTML text for a specified view.
     * @param {string} view The name of the view.
     * @param {object} dataIn Data used for EJS renderer.
     * @param {function} res Response callback called by express.
     * @param {function} next Next callback called by express.
     */
    async render(view, dataIn, res, next) {
        console.log("render " + view);
        view = this.cleanName(view);
        this._records = {};
        discover(this._records);

        if (!this._records[view]){
            next();
            return false;
        }

        this.records[view].data = {...this.records[view].data, ...dataIn};

        const record = this.records[view];
        if (record.type === CONST.TYPE.VIEW) {
            const path = Path.join(record.dir.sub, record.view);
            const libFile = Path.join(settings[`output-dir`], CONST.FILENAME.IMPORT_FILE);
            const templateFile = Path.join(settings[`output-dir`], record.dir.sub, CONST.FILENAME.TEMPLATES);

            const data = {
                widget : {
                    lib_file: Path.resolve(libFile),
                    template_file: Path.resolve(templateFile),
                },
                ...this.records[view].data
            };

            res.render(path, data, (err, html) => {
                if (err) {
                    throw new Error(err);
                } else{
                    res.send(html);
                }
            });
        }
        return true;
    }

    async middleware(req, res, next) {
        await this.render(req.originalUrl, {}, res, next);
    }

    cleanName(string){
        if (string.endsWith("/")) string = string.substring(0, string.length - 1);
        if (string.startsWith("/")) string = string.substring(1);
        return string;
    }
}

export default StaticMiddleware;
