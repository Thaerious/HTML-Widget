import child_process from "child_process";
import FS from "fs";
import CONSTANTS from "../../src/constants.js";
import { reloadSettings } from "../../src/settings.js"
import ParseArgs from "@thaerious/parseargs";
import assert from "assert";
import { writeFileField } from "../../src/loadJSON.js";
import logger from "../../src/setupLogger.js";

const TEST_DIRECTORY = `test/temp`;
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
                writeFileField(CONSTANTS.NODE_PACKAGE_FILE, "name", "@mock/test");
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

/**
 * Create the test directory.
 * Initialize NPM.
 * Install html-widget.
 * Change directory and reload settings.
 */
const cwd = process.cwd();
async function init_all(){        
    if (!process.cwd().endsWith(TEST_DIRECTORY)){
        if (FS.existsSync(TEST_DIRECTORY)) FS.rmSync(TEST_DIRECTORY, { recursive: true });
        FS.mkdirSync(TEST_DIRECTORY, {recursive : true});
        process.chdir(TEST_DIRECTORY);
    }
    await npm_init();
    await npm_i_widget();
    reloadSettings();
}

/**
 * Remove test directory unless --no-clean flag is set.
 */
function clean_up () {
    if (!args.flags[`no-clean`]) {
        // clean up test directory unless --no-clean is specified
        process.chdir(cwd);       
        if (FS.existsSync(TEST_DIRECTORY)) FS.rmSync(TEST_DIRECTORY, { recursive: true });
    } else {
        console.log("\n *** see test directory: test/temp");
    }
};

/**
 * Perform a series of tests that the files in 'path' exist.
 */
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

export {init_all, clean_up, itHasFiles, assertFields, TEST_DIRECTORY};