import FS from "fs";
import Logger from "@thaerious/logger";
import constants from "./constants.js";
import NidgetPreprocessor from "./NidgetPreprocessor.js";
import Path from "path";
import renderEJS from "./RenderEJS.js";
import renderJS from "./RenderJS.js";
import renderSCSS from "./RenderSCSS.js";
import Crypto from "crypto";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "./parseArgsOptions.js";
import GlobFS from "glob-fs";
import ReloadServer from "./ReloadServer.js";
import extractSettings from "./extractSettings.js";

const args = new ParseArgs().loadOptions(parseArgsOptions).run();
const logger = Logger.getLogger();

logger.channel(`standard`).enabled = true;
logger.channel(`verbose`).enabled = false;
logger.channel(`very-verbose`).enabled = false;
logger.channel(`debug`).enabled = false;

if (args.count(`silent`) > 0) logger.channel(`standard`).enabled = false;
if (args.count(`verbose`) >= 1) logger.channel(`verbose`).enabled = true;
if (args.count(`verbose`) >= 2) logger.channel(`very-verbose`).enabled = true;
if (args.count(`verbose`) >= 3) logger.channel(`debug`).enabled = true;

class Watcher {
    constructor () {
        this.blacklist = new Set();
        this.md5 = new Map();
        this.paths = [];
    }

    watch () {
        logger.channel(`standard`).log(`Watching Files - ctrl-c to Exit`);
        for (let dir of this.paths) {
            logger.channel(`verbose`).log(`Watching directory: ${dir}`);
            new GlobFS().readdirSync(dir);

            logger.channel(`verbose`).log(dir);
            if (dir.endsWith(`/**`)) {
                dir = dir.substring(0, dir.length - 3);
                FS.watch(dir, { recursive: true }, async (e, f) => await this.listener(dir, e, f));
            } else {
                if (dir.endsWith(`/*`)) dir = dir.substring(0, dir.length - 2);
                FS.watch(dir, { recursive: false }, async (e, f) => await this.listener(dir, e, f));
            }
        }
        this.reloadServer = new ReloadServer();
        this.reloadServer.start(constants.RELOAD_SERVER_PORT);
    }

    async startup () {
        logger.channel(`verbose`).log(`# startup`);
        this.nidgetPreprocessor = new NidgetPreprocessor();
        this.settings = extractSettings();

        if (this.settings.input) for (const path of this.settings.input) this.addPath(path);
        if (this.settings.exclude) for (const path of this.settings.exclude) this.nidgetPreprocessor.addExclude(path);
        this.nidgetPreprocessor.process();
    }

    addPath (path) {
        this.paths.push(path);
        this.nidgetPreprocessor.addPath(path);
    }

    async renderAllRecords () {
        logger.channel(`verbose`).log(`# render all records`);

        for (const record of this.nidgetPreprocessor.records) {
            logger.channel(`verbose`).log(` - ${record.name} ${record.type}`);
            try {
                await this.renderRecord(record);
            } catch (err) {
                console.log(`Error in #renderAllRecords`);
                console.log(err);
            }
        }

        logger.channel(`verbose`).log(`# hash files`);
        for (const inputPath of this.paths) {
            for (const filename of GlobFS().readdirSync(inputPath)) {
                if (!FS.lstatSync(filename).isDirectory()) {
                    const md5Hash = Crypto.createHash(`md5`).update(FS.readFileSync(filename)).digest(`hex`);
                    this.md5.set(filename, md5Hash);
                }
            }
        }
    }

    async renderRecord (record) {
        if (record.type === `view`) {
            if (record.script) {
                try {
                    await this.browserify(record);
                } catch (err) {
                    console.log(err);
                    process.exit();
                }
            }
            if (record.view) {
                this.render(record);
            }
        }

        if (record.type === `view` || record.type === `nidget`) {
            this.scss(record);
        }
    }

    async listener (directory, event, filename) {
        try {
            await this._listener(directory, event, filename);
        } catch (err) {
            console.log(err);
            this.reloadServer.error(err.message);
        }
    }

    async _listener (directory, event, filename) {
        const fullpath = Path.join(directory, filename);
        logger.channel(`debug`).log(`File change pending: ${fullpath}`);

        if (!FS.existsSync(fullpath)) {
            logger.channel(`debug`).log(`File change aborted, file not found: ${fullpath}`);
            return; // delete and renames.
        }

        if (FS.lstatSync(fullpath).isDirectory()) {
            logger.channel(`debug`).log(`File change aborted, path is directory: ${fullpath}`);
            return; // delete and renames.
        }

        if (this.blacklist.has(fullpath)) {
            logger.channel(`debug`).log(`File change aborted, file black listed: ${fullpath}`);
            return;
        }
        this.blacklist.add(fullpath);

        // Compare and/or update md5 hashes to see if the file has actually changed.
        const md5Hash = Crypto.createHash(`md5`).update(FS.readFileSync(fullpath)).digest(`hex`);
        if (this.md5.has(fullpath) && this.md5.get(fullpath) === md5Hash) {
            logger.channel(`debug`).log(`File change aborted, file not changed: ${fullpath}`);
            this.blacklist.delete(fullpath);
            return;
        }
        this.md5.set(fullpath, md5Hash);

        if (FS.existsSync(fullpath) && FS.statSync(fullpath).isFile()) {
            logger.channel(`verbose`).log(`File change accepted: ${fullpath}`);
            this.nidgetPreprocessor.process();
            const record = this.nidgetPreprocessor.getRecord(filename);
            if (record) logger.channel(`debug`).log(record.toString());
            else logger.channel(`verbose`).log(`no record found for ${fullpath}`);

            if (!record) return; // for non .js .ejs .scss files

            switch (record.type) {
            case `nidget`:
                if (record.script === fullpath) {
                    for (const parent of record.parents) {
                        if (parent.type === `view`) await this.browserify(parent);
                    }
                }
                if (record.style === fullpath) this.scss(record);
                if (record.view === fullpath) {
                    for (const parent of record.parents) {
                        if (parent.type === `view`) this.render(parent);
                    }
                }
                break;
            case `include`:
                if (record.script === fullpath) {
                    for (const parent of record.parents) {
                        if (parent.type === `view`) await this.browserify(parent);
                    }
                }
                if (record.style === fullpath) {
                    for (const parent of record.parents) {
                        if (parent.type === `view`) await this.browserify(parent);
                        if (parent.type === `nidget`) await this.browserify(parent);
                    }
                }
                if (record.view === fullpath) {
                    for (const parent of record.parents) {
                        if (parent.type === `view`) this.render(parent);
                    }
                }
                break;
            case `view`:
                if (record.script === fullpath) await this.browserify(record);
                if (record.view === fullpath) this.render(record);
                if (record.style === fullpath) this.scss(record);
                break;
            }

            if (record.type === `view`) this.reloadServer.notify(record.name + `.html`);
            for (const parent of record.parents) {
                if (parent.type === `view`) {
                    this.reloadServer.notify(parent.name + `.html`);
                }
            }
        }

        this.blacklist.delete(fullpath);
    }

    async browserify (record) {
        if (!record.script) {
            logger.channel(`warn`).log(`Browserify: missing script for record ${record.name}`);
            return;
        }

        try {
            const outputPath = Path.join(this.settings.outputPath, Path.parse(record.script).name + `.js`);            
            await renderJS(record.script, record.dependents, outputPath);
        } catch (error) {
            console.log(error.toString());
            console.log(error.code);
            console.log(record.script);
            process.exit();
        }
    }

    render (record) {
        renderEJS(record.view, record.dependents, this.settings.outputPath);
        this.blacklist.delete(record.view);
    }

    scss (record) {
        if (record.style) {
            const outname = Path.parse(record.style).name + `.css`;
            renderSCSS(record.style, Path.join(this.settings.outputPath, outname));
        }
    }
}

(async () => {
    console.log(process.cwd());
    const watcher = new Watcher();
    await watcher.startup();

    if (args.flags.record){
        await watcher.startup();
        const record = watcher.nidgetPreprocessor.getRecord(args.flags.record);
        logger.channel(`standard`).log(record.toString());
        process.exit();
    }

    if (args.flags.name) {
        if (!watcher.nidgetPreprocessor.getRecord(args.flags.name)) {
            logger.channel(`standard`).log(`Record not found for '${args.flags.name}'`);
        } else {
            const record = watcher.nidgetPreprocessor.getRecord(args.flags.name);
            await watcher.renderRecord(record);
            logger.channel(`verbose`).log(record.toString());
        }
    } else {
        await watcher.renderAllRecords();
    }

    if (args.flags.watch) {
        watcher.watch();
    }
})();
