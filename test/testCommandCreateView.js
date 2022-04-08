import assert from "assert";
import ParseArgs from "@thaerious/parseargs";
import FS from "fs";
import create from "../src/commands/create.js";
import { Commands } from "../src/cli.js";

import CONSTANTS from "../src/constants.js";
import settings from "../src/settings.js";

CONSTANTS.TEMPLATES.VIEW = "./templates/view.template.ejs";
const args = new ParseArgs().run();

settings['package'] = "@nidget/test";
settings['src'] = "test/temp/client-src";

describe("Test Command Create View", function () {
    before(function () {
        if (FS.existsSync("test/temp")) FS.rmSync("test/temp", { recursive: true });
        FS.mkdirSync("test/temp");
    });

    after(function () {
        if (!args.flags["no-clean"]) {
            if (FS.existsSync("test/temp")) FS.rmSync("test/temp", { recursive: true });
        }
    });

    describe("Test Command Create View", function () {
        before(function () {
            const commands = new Commands(["view", "index"]);
            create(null, commands, args);
        });

        it("directory exists client-src/@nidget/test/index", function () {
            const actual = FS.existsSync('test/temp/client-src/@nidget/test/index');
            assert.ok(actual);
        });

        it("injects import map into .ejs", function () {
            const text = FS.readFileSync("test/temp/client-src/@nidget/test/index/index.ejs");
            const actual = text.indexOf("import_map.ejs");
            assert.ok(actual != -1);
        });

        it("injects templates into .ejs", function () {
            const text = FS.readFileSync("test/temp/client-src/@nidget/test/index/index.ejs");
            const actual = text.indexOf("templates.ejs");
            assert.ok(actual != -1);
        });   
        
        it("injects .mjs into .ejs", function () {
            const text = FS.readFileSync("test/temp/client-src/@nidget/test/index/index.ejs");
            const actual = text.indexOf("Index.mjs");
            assert.ok(actual != -1);
        }); 

        it("creates file body.ejs", function () {
            const actual = FS.existsSync("test/temp/client-src/@nidget/test/index/body.ejs");
            assert.ok(actual != -1);
        }); 
    });
});
