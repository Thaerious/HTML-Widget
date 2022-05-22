import FS from "fs";
import Path from "path";
import Logger from "@thaerious/logger";
import CONSTANTS from "../constants.js";
import settings from "../settings.js";
import replaceInFile from "../replaceInFile.js";
import { addWidgetInfoFile } from "./init.js";
import { Commands } from "../cli.js";
import { convert, mkdirif, fsjson, bfsObject as bfs } from "@thaerious/utility";
const logger = Logger.getLogger();

function create (records, commands, args) {
    if (Array.isArray(commands)) commands = new Commands(commands);

    switch (commands.peekCommand()) {
    case `component`:
        commands.nextCommand();
        createComponent(commands.nextCommand(), args);
        break;
    case `view`:
        commands.nextCommand();
        createView(commands.nextCommand(), args);
        break;
    default:
        createComponent(commands.nextCommand(), args);
        break;
    }
}

function createView (name, args) {
    const record = instantiateRecord(name, CONSTANTS.TYPE.VIEW);
    const viewFullPath = mkdirif(record.dir.src, record.view);

    addWidgetInfoFile(args.flags.package || settings.package);

    if (!FS.existsSync(viewFullPath)) {
        logger.channel(`verbose`).log(`  \\__ + ${viewFullPath}`);
        FS.copyFileSync(CONSTANTS.TEMPLATES.VIEW, viewFullPath);
        replaceInFile(viewFullPath, `\${style}`, Path.join(record.dir.sub, record.style.dest));
        replaceInFile(viewFullPath, `\${script}`, Path.join(record.dir.sub, record.es6));
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${viewFullPath}`);
    }

    if (!FS.existsSync(Path.join(record.dir.src, record.es6))) {
        const path = mkdirif(record.dir.src, record.es6);
        logger.channel(`verbose`).log(`  \\__ + ${path}`);
        FS.writeFileSync(path, ``);
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${Path.join(record.dir.src, record.es6)}`);
    }

    if (!FS.existsSync(Path.join(record.dir.src, record.style.src))) {
        const path = mkdirif(record.dir.src, record.style.src);
        logger.channel(`verbose`).log(`  \\__ + ${path}`);
        FS.writeFileSync(path, ``);
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${Path.join(record.dir.src, record.style.src)}`);
    }

    if (!FS.existsSync(Path.join(record.dir.src, CONSTANTS.FILENAME.BODY_FILE))) {
        const path = mkdirif(record.dir.src, CONSTANTS.FILENAME.BODY_FILE);
        logger.channel(`verbose`).log(`  \\__ + ${path}`);
        FS.writeFileSync(path, ``);
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${Path.join(record.dir.src, CONSTANTS.FILENAME.BODY_FILE)}`);
    }
}

function createComponent (name, args) {
    logger.channel(`very-verbose`).log(`\\__ create widget`);

    addWidgetInfoFile(args.flags.package || settings.package);

    if (convert.dash(name).split(`-`).length < 2) {
        logger.channel(`standard`).log(`error: name must consist of two or more words (${name})`);
        process.exit();
    }

    const record = instantiateRecord(name, CONSTANTS.TYPE.COMPONENT);

    const viewPath = mkdirif(record.dir.src, record.view);
    if (!FS.existsSync(viewPath)) {
        logger.channel(`verbose`).log(`  \\__ + ${viewPath}`);
        FS.copyFileSync(CONSTANTS.TEMPLATES.COMPONENT_EJS, viewPath);
        replaceInFile(viewPath, `\${name_dash}`, convert.dash(name));
        replaceInFile(viewPath, `\${name_underscore}`, convert.delimiter(name, `_`));
        replaceInFile(viewPath, `\${style_path}`, Path.join(record.dir.sub, record.style.dest));
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${viewPath}`);
    }

    const scriptPath = Path.join(record.dir.src, record.es6);
    if (!FS.existsSync(scriptPath)) {
        logger.channel(`verbose`).log(`  \\__ + ${scriptPath}`);
        FS.copyFileSync(CONSTANTS.TEMPLATES.COMPONENT_MJS, scriptPath);
        replaceInFile(scriptPath, `\${name_dash}`, convert.dash(name));
        replaceInFile(scriptPath, `\${name_pascal}`, convert.pascal(name));
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${scriptPath}`);
    }

    const stylePath = Path.join(record.dir.src, record.style.src);
    if (!FS.existsSync(stylePath)) {
        logger.channel(`verbose`).log(`  \\__ + ${stylePath}`);
        FS.copyFileSync(CONSTANTS.TEMPLATES.COMPONENT_SCSS, stylePath);
        replaceInFile(stylePath, `\${name_dash}`, convert.dash(name));
    } else {
        logger.channel(`verbose`).log(`  \\__ = ${stylePath}`);
    }
}

function instantiateRecord (name, type) {
    let record = buildRecord({}, name, type);
    const infoPath = Path.join(record.dir.src, CONSTANTS.WIDGET_INFO_FILE);
    const widgetInfo = loadInfoFile(infoPath);
    record = buildRecord(record, name, type);

    const current = bfs.first(widgetInfo, `fullName`, record.fullName);
    if (current) return current;

    widgetInfo.components.push(record);
    fsjson.save(infoPath, widgetInfo);
    return record;
}

/**
 * Build a record from a given name,
 * @param source Predefined fields
 * @param name component / view name
 * @param type view or componentn
 */
function buildRecord (source, name, type) {
    let root = ``;
    if (name.indexOf(`/`) !== -1) {
        const parsed = Path.parse(name);
        name = parsed.name;
        root = parsed.dir;
    }

    const record = {
        ...{
            type: type,
            fullName: Path.join(root, convert.dash(name)),
            view: Path.join(name + `.ejs`),
            es6: Path.join(convert.pascal(name) + `.mjs`),
            style: {
                src: Path.join(name + `.scss`),
                dest: Path.join(name + `.css`)
            },
            dir: {
                sub: Path.join(settings.package, root, convert.dash(name)),
                src: Path.join(settings[type === CONSTANTS.TYPE.COMPONENT ? `src` : `src`], settings.package, root, convert.dash(name))
            },
            package: settings.package
        },
        ...source
    };

    if (type === CONSTANTS.TYPE.COMPONENT) {
        record.tagName = convert.dash(name);
    }

    return record;
}

function loadInfoFile (path) {
    if (!FS.existsSync(path))
        fsjson.merge(mkdirif(path), {components: []});
    return fsjson.load(path);
}

export default create;
