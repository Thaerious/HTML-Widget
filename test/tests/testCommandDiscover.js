import assert from "assert";
import ParseArgs from "@thaerious/parseargs";
import create from "../../src/commands/create.js";
import discover from "../../src/commands/discover.js";
import init from "../../src/commands/init.js";
import {init_all, clean_up } from "./scripts/initTest.js";
import { Commands } from "../../src/cli.js";
import CONST from "../../src/constants.js";

const args = new ParseArgs().run();
CONST.TEMPLATES.VIEW = `../../templates/view.template.ejs`;

describe(`Test Command Discover`, function () {
    before(init_all);
    before(()=>init());
    after(clean_up);

    describe(`Base case - no components/views created`, function () {
        it(`has widget-element`, function () {
            const records = {};
            discover(records, null, null);
            assert.ok(records['widget-element']);
        });

        it(`has text-element`, function () {
            const records = {};
            discover(records, null, null);
            assert.ok(records['widget-text']);
        });
    });

    describe(`Add a root view named index`, function () {
        before(()=>create(null, new Commands([`view`, `index`]), args));

        it(`has index`, function () {
            const records = {};
            discover(records, null, null);
            assert.ok(records['index']);
        });
    });

    describe(`Add a nested view named nested/index`, function () {
        before(()=>create(null, new Commands([`view`, `nested/index`]), args));

        it(`has nested/index`, function () {
            const records = {};
            discover(records, null, null);
            assert.ok(records['nested/index']);
        });
    });

    describe(`Add a root component named my-componenet`, function () {
        before(()=>create(null, new Commands([`component`, `my-componenet`]), args));

        it(`has my-componenet`, function () {
            const records = {};
            discover(records, null, null);
            assert.ok(records['my-componenet']);
        });
    });
});
