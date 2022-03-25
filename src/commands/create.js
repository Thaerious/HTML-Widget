import FS from "fs";
import Path from "path";
import Logger from "@thaerious/logger";
import CONSTANTS from "../constants.js";
import loadJSON from "../loadJSON.js";
import extractSettings from "../extractSettings.js";
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
    const settings = extractSettings();
    const dir = args.flags.dest || settings["view-src"];
    const viewPath = Path.join(dir, name);

    if (!FS.existsSync(viewPath)) FS.mkdirSync(viewPath, { recursive: true });

    const relativePath = Path.relative(viewPath, CONSTANTS.PARTIALS_DIR);
    // const importMapPath = Path.relative(viewPath, Path.join(settings[`output-dir`], Path.parse(CONSTANTS.LIB_FILE).name));
    const importMapPath = Path.join(settings[`output-dir`], Path.parse(CONSTANTS.LIB_FILE).name);
    const infoPath = Path.join(dir, name, CONSTANTS.NIDGET_INFO_FILE);
    const nidgetInfo = loadInfoFile(infoPath);
    const record = buildRecord(nidgetInfo, name, CONSTANTS.TYPE.VIEW);

    FS.writeFileSync(infoPath, JSON.stringify(nidgetInfo, null, 4));

    const viewFullPath = Path.join(viewPath, record.view);
    if (!FS.existsSync(viewFullPath)) {
        FS.copyFileSync(CONSTANTS.VIEW_TEMPLATE_PATH, Path.join(viewPath, record.view));
        replaceInFile(viewFullPath, "${import_map}", importMapPath);
        replaceInFile(viewFullPath, "${modules}", relativePath + "/modules");
        replaceInFile(viewFullPath, "${templates}", Path.join(record.dir.dest, CONSTANTS.FILENAME.TEMPLATES));
    }

    const scriptFullPath = Path.join(viewPath, record.es6);
    if (!FS.existsSync(scriptFullPath)) {
        FS.writeFileSync(scriptFullPath, "");
    }

    const styleFullPath = Path.join(viewPath, record.style.src);
    if (!FS.existsSync(styleFullPath)) {
        FS.writeFileSync(styleFullPath, "");
    }
}

function createNidget(name, args) {
    if (convertToDash(name).split("-").length < 2) {
        logger.channel(`standard`).log(`error: name must consist of two or more words`);
        process.exit();
    }

    name = convertDelimited(name, "_");
    const settings = extractSettings();
    const path = args.flags.dest || Path.join(settings["nidget-src"], name);
    if (!FS.existsSync(path)) FS.mkdirSync(path, { recursive: true });

    const templateName = Path.join(path, convertDelimited(name, "_"));
    const moduleSourceName = Path.join(path, convertToPascal(name, "_") + ".mjs");
    const infoPath = Path.join(path, CONSTANTS.NIDGET_INFO_FILE);
    const nidgetInfo = loadInfoFile(infoPath);
    const record = buildRecord(nidgetInfo, name, CONSTANTS.TYPE.COMPONENT);

    FS.writeFileSync(infoPath, JSON.stringify(nidgetInfo, null, 4));

    if (!args.flags["skip-templates"]) {        
        if (!FS.existsSync(templateName + ".ejs")) {
            FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.ejs"), templateName + ".ejs");
            replaceInFile(templateName + ".ejs", "${name_dash}", convertToDash(name));
            replaceInFile(templateName + ".ejs", "${name_underscore}", convertDelimited(name, "_"));
            replaceInFile(templateName + ".ejs", "${style_path}", Path.join(record.dir.dest, record.style.dest));
        }

        if (!FS.existsSync(moduleSourceName)) {
            FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.mjs"), moduleSourceName);
            replaceInFile(moduleSourceName, "${name_dash}", convertToDash(name));
            replaceInFile(moduleSourceName, "${name_pascal}", convertToPascal(name));
        }

        if (!FS.existsSync(templateName + ".scss")) {
            FS.copyFileSync(Path.join("node_modules", CONSTANTS.MODULE_NAME, "templates/template.scss"), templateName + ".scss");
            replaceInFile(templateName + ".scss", "${name_dash}", convertToDash(name));
        }
    }
}

/* if the record already exists retrieve it, else create new */
function buildRecord(nidgetInfo, name, type) {
    const settings = extractSettings();
    const packageJSON = loadJSON(CONSTANTS.NODE_PACKAGE_FILE);
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
                src : Path.join(settings[type === CONSTANTS.TYPE.COMPONENT ? "nidget-src" : "view-src"], convertToDash(name)),
                dest : Path.join(settings["output-dir"], packageJSON.name, convertToDash(name))
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
