import assert from "assert";
import FS from "fs";
import init from "../src/commands/init.js";
import import_packages from "../src/commands/import_packages.js";
import {init_all, clean_up, itHasFiles, assertFields} from "./scripts/initTest.js";
import loadJSON from "../src/loadJSON.js";

describe(`Test Command Init`, async function () {
    before(init_all);
    after(clean_up);

    describe(`Test Command Init`, function () {
        before(function () {
            init();
            import_packages();
        });

        itHasFiles("www/compiled/import_map.ejs");

        it(`has field @html-widget/core with /@html-widget/core/lib.mjs `, function(){
            const actual = loadJSON(`www/compiled/import_map.ejs`)
            const expected = {"imports": {"/@html-widget/core": "@html-widget/core/core-elements/lib.mjs"}}
            assertFields(actual, expected);
        });
    });
});
