import FS from "fs";
import Logger from "@thaerious/logger";
import constants from "./constants.js";
import NidgetPreprocessor from "./NidgetPreprocessor.js";
import Path from "path";
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
    constructor() {
        this.blacklist = new Set();
        this.md5 = new Map();
        this.paths = [];
        this.onFileUpdate = ()=>{};
    }

    watch() {
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

    async startup() {
        logger.channel(`verbose`).log(`# startup`);
        this.npp = new NidgetPreprocessor();
        this.settings = extractSettings();
        this.npp.applySettings(settings);
    }

    addPath(path) {
        this.paths.push(path);
        this.npp.addPath(path);
    }

    async listener(directory, event, filename) {
        try {
            await this._listener(directory, filename);
        } catch (err) {
            logger.channel("standard").log(err);
            this.reloadServer.error(err.message);
        }
    }

    async _listener(directory, filename) {
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
            this.onFileUpdate(fullpath);
        }

        this.blacklist.delete(fullpath);
    }
}

export default Watcher;