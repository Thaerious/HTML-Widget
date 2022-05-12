import assert from "assert";
import FS from "fs";
import init from "../src/commands/init.js";
import {init_all, clean_up } from "./scripts/initTest.js";
import loadJSON from "../src/loadJSON.js";

describe(`Test Command Init`, async function () {
    before(init_all);
    after(clean_up);

    describe(`Test Command Init`, function () {
        before(function () {
            init(null, null, null);
        });

        it(`creates the 'client-src' directory`, function () {
            const actual = FS.existsSync(`client-src/@mock/test/`);
            assert.ok(actual);
        });

        it(`creates the 'www/static' directory`, function () {
            const actual = FS.existsSync(`www/static`);
            assert.ok(actual);
        });

        it(`creates the '.widgetrc' file in the root directory`, function () {
            const actual = FS.existsSync(`.widgetrc`);
            assert.ok(actual);
        });

        it(`creates the '.widgetinfo' file in the package source directory`, function () {
            const actual = FS.existsSync(`client-src/@mock/test/widget.info`);
            assert.ok(actual);
        });

        it(`'.widgetinfo' has the link key with package name value`, function () {
            const json = loadJSON(`client-src/@mock/test/widget.info`);
            const actual = json.link;
            const expected = "@mock/test";
            assert.ok(actual);
        });

        describe("Run the init command again", function () {
            before(function () {
                // mark the .widgetrc file
                const widgetrc = loadJSON(`.widgetrc`);
                widgetrc.modified = "not-modified";
                FS.writeFileSync(`.widgetrc`, JSON.stringify(widgetrc, null, 2));

                // mark the .widgetinfo file
                const widgetinfo = loadJSON(`client-src/@mock/test/widget.info`);
                widgetinfo.modified = "not-modified";
                FS.writeFileSync(`client-src/@mock/test/widget.info`, JSON.stringify(widgetinfo, null, 2));
                init(null, null, null);
            });

            it(`does not create a new .widgetrc file`, function () {
                const json = loadJSON(`.widgetrc`);
                const actual = json.modified;
                const expected = "not-modified";
                assert.strictEqual(actual, expected);
            });

            it(`does not create a new .widgetinfo file`, function () {
                const json = loadJSON(`client-src/@mock/test/widget.info`);
                const actual = json.modified;
                const expected = "not-modified";
                assert.strictEqual(actual, expected);
            });
        });

        describe(`Delete the .widgetrc file and run the init command again`, function () {
            before(function () {
                // mark the .widgetrc file
                FS.rmSync(`.widgetrc`);
                init(null, null, null);
            });

            it(`creates the '.widgetinfo' file in the package source directory`, function () {
                const actual = FS.existsSync(`client-src/@mock/test/widget.info`);
                assert.ok(actual);
            });
        });

        describe(`Delete the 'client-src' directory and run the init command again`, function () {
            before(function () {
                // mark the .widgetrc file
                FS.rmSync(`client-src`, { recursive: true });
                init(null, null, null);
            });

            it(`creates the '.widgetrc' file in the root directory`, function () {
                const actual = FS.existsSync(`.widgetrc`);
                assert.ok(actual);
            });
        });
    });
});
