#!/usr/bin/env node

import ParseArgs from "@thaerious/parseargs";
import FS from "fs";
import CONSTANTS from "./constants.js";
import Logger from "@thaerious/logger";
import Path from "path";
import extractSettings from "./extractSettings.js";
import loadJSON from "./loadJSON.js";
import getDependencies from "./getDependencies.js";

class Commands{        
    /**
     * @param commandStack An array to use for the command stack.
     */
    constructor(commandStack){
        this.commandStack = commandStack;
        this._prev = [];
    }

    nextCommand() {
        if (this.commandStack.length === 0) throw("command parse error: empty command stack");
        this._prev.unshift(this.commandStack.shift().toLowerCase());
        return this._prev[0]
    }

    hasNext(){
        return this.commandStack.length > 0;
    }

    peekCommand() {
        return this.commandStack[0].toLowerCase();
    }

    get prev(){
        return this._prev[0];
    }
}

const parseArgsOptions = {
    flags: [
        {
            long: `verbose`,
            short: `v`,
            type: `boolean`,
        },
        {
            long: `name`,
            short: `n`,
            type: `string`,
        },
        {
            long: `output`,
            short: `o`,
            type: `string`,
        },
        {
            long: `input`,
            short: `i`,
            type: `string`,
        }, 
        {
            long: `dest`,
            short: `d`,
            type: `string`,
        },         
    ],
};

const logger = Logger.getLogger();
logger.channel(`standard`).enabled = true;
logger.channel(`verbose`).enabled = false;
logger.channel(`very-verbose`).enabled = false;
logger.channel(`debug`).enabled = false;
logger.channel(`warning`).enabled = true;

logger.channel(`warning`).prefix = (f, l, o) => `* WARNING `;

// logger.channel(`very-verbose`).prefix = (f, l, o)=>`${f} ${l} `;

const args = new ParseArgs().loadOptions(parseArgsOptions).run();
if (args.count(`silent`) > 0) logger.channel(`standard`).enabled = false;
if (args.count(`silent`) > 0) logger.channel(`warning`).enabled = false;
if (args.count(`verbose`) >= 1) logger.channel(`verbose`).enabled = true;
if (args.count(`verbose`) >= 2) logger.channel(`very-verbose`).enabled = true;
if (args.count(`verbose`) >= 3) logger.channel(`debug`).enabled = true;

let commands;

(async () => {
    try{
        const rvalue = await nidgetCli(args.args);
    } catch (err) {
        if (err.code === "ERR_MODULE_NOT_FOUND"){
            logger.channel(`standard`).log(`unknown command : ${commands.prev}`);
            logger.channel(`verbose`).log(err);
        } else {
            console.log("ERROR");
            console.log(err);
        }
    }
})();

async function nidgetCli(commandStack) {
    let started = false; // so that we can burn through the node part of the command line
    let npp, rvalue;
    let records = {};
    commands = new Commands(commandStack);

    while (commandStack.length > 0) {
        npp = nppLoadIf(npp);
        const module = `./commands/${commands.nextCommand()}.js`;
        if (module.endsWith("nidget.js")){
             started = true;
             continue;
        }

        if (!started) continue;

        const { default: command } = await import(module);
        logger.channel(`verbose`).log(`# ${commands.prev}`);
        rvalue = await command(records, commands, args);
        logger.channel("very-verbose").log(`uptime ${process.uptime()} s`);                 
    }

    return rvalue;  
}

        // switch (nextCommand()) {
        //     case "settings":
        //         console.log(extractSettings());
        //         break;
        //     case "i":
        //     case "init":
        //         loadNPP();
        //         const command = await import(`./commands/${cmd}.js`);
        //         break;
        //     case "create":
        //         switch (peekCommand()) {
        //             case "nidget":
        //                 nextCommand();
        //                 createNidget(nextCommand());
        //                 break;
        //             case "view":
        //                 nextCommand();
        //                 createView(nextCommand());
        //                 break;
        //             default:
        //                 createNidget(nextCommand());
        //                 break;
        //         }
        //     case "records":
        //         await printRecords();
        //         break;
        //     case "pack":
        //         await pack();
        //         break;
        //     case "disc":
        //     case "discover":
        //         rvalue = await discover();
        //         break;
        //     case "link":
        //         rvalue = await link();
        //         break;
        //     case "style":
        //     case "sass":
        //         await sass();
        //         break;
        //     case "readme":
        //         readme();
        //         break;
        //     case "view":
        //         await ejs();
        //         break;
        //     case "script":
        //         await es6();
        //         break;
        //     case "deploy":
        //         await deploy();
        //         break;
        //     case "clean":
        //         clean();
        //         break;
        //     case "help":
        //         help(commands);
        //         break;
        //     case "settings":
        //         settings();
        //         break;
        //     case "dependencies":
        //         rvalue = dependencies(nextCommand());
        //         break;
        // }
    // }
// }

async function dependencies(recordName){
    await nppLoadIf();
    const record = npp.getRecord(recordName);
    const dependencies = getDependencies(record, npp);
    return dependencies;
}

async function pack() {
    const rvalue = [];

    await nppLoadIf();
    npp.discover();

    for (const record of npp.records) {
        if (record.type === "nidget") {
            rvalue[record.tagName] = record.toJSON();
        }
    }

    if (FS.existsSync(CONSTANTS.NIDGET_PROPERTY_FILE)) {
        const settings = loadJSON(CONSTANTS.NIDGET_PROPERTY_FILE);

        settings.records = rvalue;
        FS.writeFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, JSON.stringify(settings, null, 2), "utf-8");
    }
}

async function nppLoadIf(npp) {
    if (!npp) {
        const { default: NidgetPreprocessor } = await import(`./NidgetPreprocessor.js`);
        npp = new NidgetPreprocessor();
        npp.applySettings(extractSettings());
    }
    return npp;
}

function settings() {
    const settings = extractSettings();
    for (const key of Object.keys(settings)) {
        logger.channel("standard").log(`${key} : ${settings[key]}`);
    }
}

async function discover() {
    await nppLoadIf();
    npp.discover();

    const rvalue = [];
    for (const record of npp.records) rvalue.push(record);
    return rvalue;
}

async function link() {
    await nppLoadIf();
    npp.loadLibs();

    const rvalue = [];
    for (const record of npp.records) rvalue.push(record);
    return rvalue;
}

async function deploy() {
    await nppLoadIf();
    npp.discover();
    npp.loadLibs();
    npp.ejs();
    npp.sass();
    npp.copyMJS(args.flags["link"]);
}

async function ejs() {
    await nppLoadIf();
    npp.linkEJS();
}

async function es6() {
    await nppLoadIf();
    npp.linkMJS();
}

async function sass() {
    await nppLoadIf();
    npp.sass();
}

function clean() {
    const settings = extractSettings();

    if (FS.existsSync(settings["package-dir"])) {
        logger.channel(`verbose`).log(`clean ${settings["package-dir"]}`);
        FS.rmSync(settings["package-dir"], { recursive: true });
    }
    if (FS.existsSync(settings["output-dir"])) {
        logger.channel(`verbose`).log(`clean ${settings["output-dir"]}`);
        FS.rmSync(settings["output-dir"], { recursive: true });
    }

    if (!FS.existsSync(CONSTANTS.NIDGET_PROPERTY_FILE)) return;
    const nidgetJSON = JSON.parse(FS.readFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, "utf-8"));
    nidgetJSON.records = {};
    FS.writeFileSync(CONSTANTS.NIDGET_PROPERTY_FILE, JSON.stringify(nidgetJSON, null, 2));
}

async function printRecords() {
    await nppLoadIf();
    for (const record of npp.records) {
        logger.channel(`standard`).log(JSON.stringify(record, null, 2));
    }
}

function readme() {
    const path = Path.join("node_modules", CONSTANTS.MODULE_NAME, "readme.md");
    const text = FS.readFileSync(path, "utf-8");
    logger.channel("standard").log(text);
}

function help(commands) {
    const helpContext = commands?.shift() || "index";
    const path = Path.join(CONSTANTS.NODE_MODULES_PATH, CONSTANTS.MODULE_NAME, `help/${helpContext}.txt`);
    console.log(path);
    if (!FS.existsSync(path)) {
        logger.channel("standard").log(`Help for command '${helpContext}' not found.`);
    } else {
        const text = FS.readFileSync(path, "utf-8");
        logger.channel("standard").log(text);
    }
}

export default nidgetCli;
