import assert from "assert";
import ParseArgs from "@thaerious/parseargs";
import FS from "fs";
import Path from "path";
import create from "../src/commands/create.js";
import { Commands } from "../src/cli.js";
import {init_all, clean_up } from "./scripts/initTest.js";
import settings from "../src/settings.js";
import { fsjson } from "@thaerious/utility";
const args = new ParseArgs().run();

settings[`package`] = `@mock/test`;

describe(`Test Command Create View`, function () {
    before(init_all);
    after(clean_up);

    describe(`Test Command Create View`, function () {
        before(function () {
            create(null, [`view`, `index`], args);
        });

        it(`creates widget.info file in client-src/@mock/test/`, function () {
            assert.ok(FS.existsSync(`client-src/@mock/test/widget.info`));
        });

        it(`creates directory client-src/@mock/test/index`, function () {
            const actual = FS.existsSync(`client-src/@mock/test/index`);
            assert.ok(actual);
        });
        
        it(`injects .mjs into .ejs`, function () {
            const text = FS.readFileSync(`client-src/@mock/test/index/index.ejs`);
            const actual = text.indexOf(`Index.mjs`);
            assert.ok(actual != -1);
        }); 

        it(`creates file body.ejs`, function () {
            const actual = FS.existsSync(`client-src/@mock/test/index/body.ejs`);
            assert.ok(actual != -1);
        }); 

        it(`creates widget.info file`, function () {
            const actual = FS.existsSync(`client-src/@mock/test/index/widget.info`);
            assert.ok(actual != -1);
        }); 

        describe(`Run the command again`, function () {
            before(function () {
                FS.writeFileSync(`client-src/@mock/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.scss`, `not-modified`);

                const json = fsjson.load(`client-src/@mock/test/index/widget.info`);
                json.modified = "not-modified";
                FS.writeFileSync(`client-src/@mock/test/index/widget.info`, JSON.stringify(json, null, 2));

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`doesn't overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.scss`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite widget.info file`, function () {
                const actual = fsjson.load(`client-src/@mock/test/index/widget.info`).modified;
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });
        });  

        describe(`Remove widget.info file and run the command again`, function () {
            before(function () {
                FS.writeFileSync(`client-src/@mock/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.scss`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/widget.info`, `not-modified`);

                FS.rmSync(`client-src/@mock/test/index/widget.info`);

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`doesn't overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.scss`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`overwrite widget.info file`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/widget.info`).toString();
                const expected = `not-modified`;
                assert.notStrictEqual(actual, expected);
            });
        });

        describe(`Remove index.scss file and run the command again`, function () {
            before(function () {
                FS.writeFileSync(`client-src/@mock/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.scss`, `not-modified`);

                const json = fsjson.load(`client-src/@mock/test/index/widget.info`);
                json.modified = "not-modified";
                FS.writeFileSync(`client-src/@mock/test/index/widget.info`, JSON.stringify(json, null, 2));

                FS.rmSync(`client-src/@mock/test/index/index.scss`);

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`doesn't overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`overwrite index.scss`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.notStrictEqual(actual, expected);
            });

            it(`doesn't overwrite widget.info file`, function () {
                const actual = fsjson.load(`client-src/@mock/test/index/widget.info`).modified;
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });
        });        

        describe(`Remove index.ejs file and run the command again`, function () {
            before(function () {
                FS.writeFileSync(`client-src/@mock/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.scss`, `not-modified`);

                const json = fsjson.load(`client-src/@mock/test/index/widget.info`);
                json.modified = "not-modified";
                FS.writeFileSync(`client-src/@mock/test/index/widget.info`, JSON.stringify(json, null, 2));

                FS.rmSync(`client-src/@mock/test/index/index.ejs`);

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`doesn't overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.notStrictEqual(actual, expected);
            });

            it(`doesn't overwrite index.scss`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite widget.info file`, function () {
                const actual = fsjson.load(`client-src/@mock/test/index/widget.info`).modified;
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });
        });  

        describe(`Remove body.ejs file and run the command again`, function () {
            before(function () {
                FS.writeFileSync(`client-src/@mock/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.scss`, `not-modified`);

                const json = fsjson.load(`client-src/@mock/test/index/widget.info`);
                json.modified = "not-modified";
                FS.writeFileSync(`client-src/@mock/test/index/widget.info`, JSON.stringify(json, null, 2));

                FS.rmSync(`client-src/@mock/test/index/body.ejs`);

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`doesn't overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.notStrictEqual(actual, expected);
            });

            it(`doesn't overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.scss`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite widget.info file`, function () {
                const actual = fsjson.load(`client-src/@mock/test/index/widget.info`).modified;
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });
        });  

        describe(`Remove Index.mjs file and run the command again`, function () {
            before(function () {
                FS.writeFileSync(`client-src/@mock/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`client-src/@mock/test/index/index.scss`, `not-modified`);

                const json = fsjson.load(`client-src/@mock/test/index/widget.info`);
                json.modified = "not-modified";
                FS.writeFileSync(`client-src/@mock/test/index/widget.info`, JSON.stringify(json, null, 2));

                FS.rmSync(`client-src/@mock/test/index/Index.mjs`);

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.notStrictEqual(actual, expected);
            });

            it(`doesn't overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.scss`, function () {
                const actual = FS.readFileSync(`client-src/@mock/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite widget.info file`, function () {
                const actual = fsjson.load(`client-src/@mock/test/index/widget.info`).modified;
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });
        }); 
    });
});
