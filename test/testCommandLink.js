import assert from "assert";
import FS from "fs";
import init from "../src/commands/init.js";
import link from "../src/commands/link.js";
import {init_all, clean_up } from "./scripts/initTest.js";
import loadJSON from "../src/loadJSON.js";

describe(`Test Command Init`, async function () {
    before(init_all);
    after(clean_up);

    describe(`Test Command Link`, function () {
        before(function () {
            init();
            link();
        });

        // it("has a link in /linked/test
    });
});
