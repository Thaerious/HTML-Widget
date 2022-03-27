import FS from "fs";
import Path from "path";
import Logger from "@thaerious/logger";
import CONSTANTS from "../constants.js";
import loadJSON from "../loadJSON.js";
import settings from "../settings.js";
import replaceInFile from "../replaceInFile.js";
import { bfsObject } from "../bfsObject.js";
import { convertToDash, convertToPascal, convertDelimited } from "../names.js";
const logger = Logger.getLogger();

function create(records, commands, args) {
    switch (commands.peekCommand()) {
        case "component":
            commands.nextCommand();
            createNidget(commands.nextCommand(), args);
            break;
        case "view":
            commands.nextCommand();
            createView(commands.nextCommand(), args);
            break;
        default:
            createNidget(commands.nextCommand(), args);
            break;
    }
}

function createView(name, args) {
    const destPath = Path.join(settings["src"], name);
    if (!FS.existsSync(destPath)) FS.mkdirSync(destPath, { recursive: true });

    // load any nidget.info already in the path or make a new one
    const infoPath = Path.join(destPath, CONSTANTS.NIDGET_INFO_FILE);
    const nidgetInfo = loadInfoFile(infoPath);
    const record = buildRecord(nidgetInfo, name, CONSTANTS.TYPE.VIEW);
    FS.writeFileSync(infoPath, JSON.stringify(nidgetInfo, null, 4));

    const viewFullPath = Path.join(destPath, record.view);
    if (!FS.existsSync(viewFullPath)) {
        const viewTemplatePath = Path.join(settings["node-modules"], CONSTANTS.MODULE_NAME, "templates", CONSTANTS.TEMPLATES.VIEW);
        FS.copyFileSync(viewTemplatePath, Path.join(destPath, record.view));
        const templatePath = Path.join(record.package, record.tagName, CONSTANTS.FILENAME.TEMPLATES);
        replaceInFile(viewFullPath, "${templates}", templatePath);
    } else {
        logger.channel("standard").log(`skipping existing file ${viewFullPath}`);
    }

    const scriptFullPath = Path.join(destPath, record.es6);
    if (!FS.existsSync(scriptFullPath)) {
        FS.writeFileSync(scriptFullPath, "");
    }
    else {
        logger.channel("standard").log(`skipping existing file ${scriptFullPath}`);
    }

    const styleFullPath = Path.join(destPath, record.style.src);
    if (!FS.existsSync(styleFullPath)) {
        FS.writeFileSync(styleFullPath, "");
    }
    else {
        logger.channel("standard").log(`skipping existing file ${styleFullPath}`);
    }
}

function createNidget(name, args) {
    logger.channel("very-verbose").log("\__ create nidget");

    if (convertToDash(name).split("-").length < 2) {
        logger.channel(`standard`).log(`error: name must consist of two or more words (${name})`);
        process.exit();
    }

    name = convertDelimited(name, "_");

    const destPath = Path.join(settings["src"], convertToDash(name));
    if (!FS.existsSync(destPath)) FS.mkdirSync(destPath, { recursive: true });

    // load any nidget.info already in the path or make a new one
    const infoPath = Path.join(destPath, CONSTANTS.NIDGET_INFO_FILE);
    const nidgetInfo = loadInfoFile(infoPath);
    const record = buildRecord(nidgetInfo, name, CONSTANTS.TYPE.COMPONENT);
    FS.writeFileSync(infoPath, JSON.stringify(nidgetInfo, null, 4));

    if (!args.flags["skip-templates"]) {       
        const viewPath = Path.join(record.dir.src,  record.view);
        if (!FS.existsSync(viewPath)) {
            FS.copyFileSync(Path.join(settings["node-modules"], CONSTANTS.MODULE_NAME, "templates/template.ejs"), viewPath);
            replaceInFile(viewPath, "${name_dash}", convertToDash(name));
            replaceInFile(viewPath, "${name_underscore}", convertDelimited(name, "_"));
            replaceInFile(viewPath, "${style_path}", Path.join(record.dir.sub, record.style.dest));
        } else {
            logger.channel("standard").log(`skipping existing file ${viewPath}`);
        }

        const scriptPath = Path.join(record.dir.src, record.es6);
        if (!FS.existsSync(scriptPath)) {
            FS.copyFileSync(Path.join(settings["node-modules"], CONSTANTS.MODULE_NAME, "templates/template.mjs"), scriptPath);
            replaceInFile(scriptPath, "${name_dash}", convertToDash(name));
            replaceInFile(scriptPath, "${name_pascal}", convertToPascal(name));
        } else {
            logger.channel("standard").log(`skipping existing file ${scriptPath}`);
        }

        const stylePath = Path.join(record.dir.src, record.style.src);
        if (!FS.existsSync(stylePath)) {
            FS.copyFileSync(Path.join(settings["node-modules"], CONSTANTS.MODULE_NAME, "templates/template.scss"), stylePath);
            replaceInFile(stylePath, "${name_dash}", convertToDash(name));
        }
        else {
            logger.channel("standard").log(`skipping existing file ${stylePath}`);
        }
    }
}

/* if the record already exists retrieve it, else create new */
function buildRecord(nidgetInfo, name, type) {
    const packageJSON = loadJSON(settings["package-json"]);

    if (!packageJSON.name){
        throw new Error(`no name field found in ${settings["package-json"]}, run npm init`);
    }

    let record = bfsObject(nidgetInfo, "tagName", convertToDash(name));
    if (!record) {
        record = {
            type: type,
            tagName: convertToDash(name),
            view: name + ".ejs",
            es6: convertToPascal(name) + ".mjs",
            style: {
                src: name + ".scss",
                dest: name + ".css",
            },
            dir : {
                sub : Path.join(packageJSON.name, convertToDash(name)),
                src : Path.join(settings[type === CONSTANTS.TYPE.COMPONENT ? "src" : "src"], convertToDash(name))
            },
            package: packageJSON.name,
        };
        nidgetInfo.components.push(record);
    }
    return record;
}

function loadInfoFile(path) {
    if (!FS.existsSync(path)) {
        const nidgetInfo = {
            components: [],
        };
        FS.writeFileSync(path, JSON.stringify(nidgetInfo, null, 4));
    }

    return loadJSON(path);
}

export default create;
