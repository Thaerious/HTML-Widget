import assert from "assert";
import FS from "fs";
import init from "../../src/commands/init.js";
import link from "../../src/commands/link.js";
import { init_all, clean_up, itHasFiles } from "../scripts/initTest.js";
import { fsjson } from "@thaerious/utility"
import enumeratePackages from "../../src/enumeratePackages.js";

describe(`Test Enumerate Packages`, function () {
    describe(`Test Command Init`, function () {
        before(function () {
            this.result = enumeratePackages("test/test-enumerate-packages");
            console.log(this.result);
        });

        it(`has both root packages`, function () {
            const expected = 4;
            const actual = this.result.size;
            assert.strictEqual(actual, expected);
        });

        it(`check correct path on 1st level package`, function () {
            const expected = 'test/test-enumerate-packages/node_modules/apple';
            const actual = this.result.get("apple_pkg");
            assert.strictEqual(actual, expected);
        });

        it(`check correct path on 2nd level package`, function () {
            const expected = 'test/test-enumerate-packages/node_modules/@sub/apple';
            const actual = this.result.get("fruit_pkg");
            assert.strictEqual(actual, expected);
        });      
        
        it(`check correct path on linked package`, function () {
            const expected = '/home/edward/project/trunk/html-widget/test/test-enumerate-packages/ext_pkg';
            const actual = this.result.get("ext_pkg");
            assert.strictEqual(actual, expected);
        });         
    });
});