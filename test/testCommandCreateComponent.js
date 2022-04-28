import assert from "assert";
import ParseArgs from "@thaerious/parseargs";
import FS from "fs";
import create from "../src/commands/create.js";
import { Commands } from "../src/cli.js";
import {init_all, clean_up } from "./scripts/initTest.js";
import CONSTANTS from "../src/constants.js";
import settings from "../src/settings.js";
import loadJSON from "../src/loadJSON.js";
const args = new ParseArgs().run();

settings[`package`] = `@html-widget/test`;

function assertFiles(...paths) {
    for (const path of paths) {
        it(`creates file ${path}`, function () {
            const actual = FS.existsSync(path);
            assert.ok(actual);
        });
    }
}

const filenames = [
    "client-src/@html-widget/test/my-component/MyComponent.mjs",
    "client-src/@html-widget/test/my-component/my-component.ejs",
    "client-src/@html-widget/test/my-component/my-component.scss"
];

describe(`Test Command Create Component`, function () {
    before(init_all);
    after(clean_up);

    describe(`Run command 'create component my-component'`, function () {
        before(function () {
            const commands = new Commands([`component`, `my-component`]);
            create(null, commands, args);
        });

        assertFiles.bind(this)(...filenames, "client-src/@html-widget/test/my-component/widget.info");

        it("widget.info has 1 entry under components", function(){
            const json = loadJSON("client-src/@html-widget/test/my-component/widget.info");
            const actual = json.components.length;
            const expected = 1;
            assert.strictEqual(actual, expected);
        });
    });

    describe(`Deleting a file, then running the command again. Will create only the deleted file`, function () {
        for (const path of filenames) {
            describe(`delete file ${path}`, function () {
                before(function () {
                    for (const path of filenames) FS.writeFileSync(path, "unchanged");
                    FS.rmSync(path);
                    const commands = new Commands([`component`, `my-component`]);
                    create(null, commands, args);
                });

                it(`${path} file is created`, function () {
                    const actual = FS.existsSync(path);
                    const expected = true
                    assert.strictEqual(actual, expected);
                });

                for (const other of filenames) {
                    if (other === path) continue;
                    it(`${other} file has not changed`, function () {
                        const actual = FS.readFileSync(other).toString();
                        const expected = "unchanged";
                        assert.strictEqual(actual, expected);
                    });
                }

                it("widget.info has 1 entry under components", function(){
                    const json = loadJSON("client-src/@html-widget/test/my-component/widget.info");
                    const actual = json.components.length;
                    const expected = 1;
                    assert.strictEqual(actual, expected);
                });                
            });
        }
    });
});
