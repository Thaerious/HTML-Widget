import child_process from "child_process";
import FS from "fs";
import Path from "path";
import CONSTANTS from "../../src/constants.js";
import loadJSON from "../../src/loadJSON.js";
import { reloadSettings } from "../../src/settings.js"
import ParseArgs from "@thaerious/parseargs";
import logger from "../../src/setupLogger.js";
import assert from "assert";

const args = new ParseArgs().run();

/**
 * Start and record a new process.
 * Will remove self from this.processes when complete.
 * Updates database when complete.
 */
 function npm_init() {
    const cmd = "npm init -y";

    return new Promise((resolve, reject) => {
        child_process.exec(cmd, async (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                const packageJSON = loadJSON(CONSTANTS.NODE_PACKAGE_FILE);
                packageJSON.name = "@html-widget/test";
                FS.writeFileSync(CONSTANTS.NODE_PACKAGE_FILE, JSON.stringify(packageJSON, null, 2));
                resolve(stdout);
            }
        });
    });
}

/**
 * NPM install the html-widget package into the test directory.
 */
function npm_i_widget() {
    const cmd = "npm i ../..";

    return new Promise((resolve, reject) => {
        child_process.exec(cmd, async (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
}

async function init_all(){
    if (FS.existsSync(`test/temp`)) FS.rmSync(`test/temp`, { recursive: true });
    FS.mkdirSync(`test/temp`, {recursive : true});
    if (!process.cwd().endsWith("test/temp")) process.chdir(`test/temp`);
    console.log(Path.resolve(CONSTANTS.NODE_PACKAGE_FILE));
    await npm_init();
    await npm_i_widget();
    reloadSettings();
}

function clean_up () {
    if (!args.flags[`no-clean`]) {
        // clean up test directory unless --no-clean is specified
        if (FS.existsSync(`test/temp`)) FS.rmSync(`test/temp`, { recursive: true });
    } else {
        console.log("\n *** see test directory: test/temp");
    }
};

function itHasFiles(...paths) {
    for (const path of paths) {
        it(`creates file ${path}`, function () {
            const actual = FS.existsSync(path);
            assert.ok(actual);
        });
    }
}

/**
 * Assert that all fields in expected are equal to any field in actual
 * @param actual
 * @param expected
 */
 function assertFields(actual, expected) {
    for (let parameter in expected) {
        const exp = expected[parameter];
        const acp = actual[parameter];
        assert.deepStrictEqual(acp, exp);
    };
}

export {init_all, clean_up, itHasFiles, assertFields};