import Logger from "@thaerious/logger";
import FS from "fs";
import { parseHTML } from "linkedom";
import collectImports from "./collectImports.js";
import Path from "path";

class Warn {
    constructor() {
        this.previous = new Set();
    }

    warn(file, nidget) {
        if (this.previous.has(`${file}:${nidget}`)) return;
        this.previous.add(`${file}:${nidget}`);
        logger.warn(`warning: unknown data-include ${nidget} in ${file}`);
    }
}
const warner = new Warn();
const logger = Logger.getLogger();

/**
 * A record object for a single Nidget or root file.
 * It may or may not have an associated script file or view file (must have at least one of them).
 * All nidgets that this nidget refrences are considered dependencies.
 */
 class DependencyRecord {
    constructor(nidgetName = ``, nidgetPackage = ``) {
        this._name = nidgetName;
        this._root = ``;
        this._es6 = ``;
        this._script = ``;
        this._view = ``;
        this._style = ``;
        this._package = nidgetPackage;
        this._includes = new Set();
        this._parents = new Set();
        this._type = ``;
        this._html = ``;
    }

    addDependency(record) {
        this._includes.add(record);
        record._parents.add(this);
    }

    get parents() {
        const set = new Set();
        const stack = [this];

        while (stack.length > 0) {
            const current = stack.shift();
            for (const parent of current._parents) {
                if (!set.has(parent)) {
                    set.add(parent);
                    stack.push(parent);
                }
            }
        }
        return set;
    }

    /* return a non-reflective set of dependency records */
    get includes() {
        const set = new Set();
        const stack = [this];

        while (stack.length > 0) {
            const current = stack.shift();
            if (!set.has(current)) {
                set.add(current);
                for (const dep of current._includes) {
                    stack.push(dep);
                }
            }
        }
        set.delete(this);
        return set;
    }

    get name(){
        return this._name;
    }

    set name(value){
        if (typeof value !== `string`) throw new Error(`expected string found ${typeof value}`);
        this._name = value;
    }

    get root(){
        return this._root;
    }

    set root(value){
        if (typeof value !== `string`) throw new Error(`expected string found ${typeof value}`);
        this._root = value;
    }

    get es6(){
        return this._es6;
    }

    set es6(value){
        if (typeof value !== `string`) throw new Error(`expected string found ${typeof value}`);
        this._es6 = value;
    }

    get script() {
        return this._script;
    }

    set script(value) {
        if (typeof value !== `string`) throw new Error(`expected string found ${typeof value}`);
        this._script = value;
    }

    set html(value){
        this._html = value;
    }

    get html(){
        return this._html;
    }

    get view() {
        return this._view;
    }

    set view(value) {
        if (typeof value !== `string`) throw new Error(`expected string found ${typeof value}`);
        this._view = value;
    }

    set type(value) {
        if (typeof value !== `string`) throw new Error(`expected string found ${typeof value}`);
        this._type = value;
    }

    get type() {
        return this._type;
    }

    get style() {
        return this._style;
    }

    set style(value) {
        if (typeof value !== `string`) throw new Error(`expected string found ${typeof value}`);
        this._style = value;
    }

    get package() {
        return this._package;
    }

    set package(value) {
        if (typeof value !== `string`) throw new Error(`expected string found ${typeof value}`);
        this._package = value;
    }

    toString() {
        return (
            `NidgetRecord {\n` +
            `\tname : ${this.name}\n` +
            `\troot : ${this.root}\n` +
            `\tes6: ${this.es6}\n` +
            `\tscript : ${this.script}\n` +
            `\tview : ${this.view}\n` +
            `\thtml : ${this.html}\n` +
            `\tstyle : ${this.style}\n` +
            `\ttype : ${this.type}\n` +
            `\tpackage : ${this.package}\n` +
            `\tincludes : Set(${this.includes.size}){\n` +
            [...this.includes].reduce((p, c) => `${p}\t\t${c.name}\n`, ``) +
            `\t}\n` +
            `\tparents : Set(${this.parents.size}){\n` +
            [...this.parents].reduce((p, c) => `${p}\t\t${c.name}\n`, ``) +
            `\t}\n`
        );
    }

    toJSON() {
        const json = {
            name: this.name,
            root: this.root,
            es6 : this.es6,
            script: this.script,
            view: this.view,
            html: this.html,
            style: this.style,
            type: this.type,
            package: this.package
        };
        return json;
    }

    /**
     * Get all dependencies for a single nidget ejs file.
     *
     * Adds any dependencies in the data-include attribute of the template (comma or space delimited).
     * Then searches for any tag-names that match any .ejs files in the nidgets subdirectory.
     */
    seekEJSDependencies(npp) {
        if (this.view === ``) return;
        if (!FS.existsSync(this.view)) return;
        
        const fileString = FS.readFileSync(this.view);
        const htmlString = `<html><body>${fileString}</body></html>`;
        const dom = parseHTML(htmlString);

        const template = dom.document.querySelector(`template`);

        if (template) {
            const includes = template.getAttribute(`data-include`) ?? ``;
            const split = includes.split(/[ ,]+/g);

            for (const s of split) {
                const dependencyName = s.trim();
                if (dependencyName !== ``) {
                    if (npp.hasRecord(dependencyName)) {
                        const record = npp.getRecord(dependencyName);
                        this.addDependency(record);
                    } else {
                        warner.warn(this.name, s.trim());
                    }
                }
            }
        }

        for (const record of npp.records) {
            if (this._includes.has(record)) continue;

            if (template?.content.querySelector(record.name) || dom.window.document.querySelector(record.name)) {
                this.addDependency(record);
            }
        }
    }

    /**
     * Seek out JS dependencies in this record's script.
     * The dependency is not neccesarily a Nidget.
     */
    seekJSDependencies(NPP) {
        for (const importRec of collectImports(this.es6)){
            if (NPP.hasRecord(importRec.className)){
                if (NPP.getRecord(importRec.className).package === importRec.packageName){
                    this.addDependency(NPP.getRecord(importRec.className));
                }
            }
        }
    }
}

export default DependencyRecord;