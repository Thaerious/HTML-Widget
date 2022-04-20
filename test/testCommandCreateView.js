import assert from "assert";
import ParseArgs from "@thaerious/parseargs";
import FS from "fs";
import create from "../src/commands/create.js";
import { Commands } from "../src/cli.js";

import CONSTANTS from "../src/constants.js";
import settings from "../src/settings.js";
import loadJSON from "../src/loadJSON.js";

CONSTANTS.TEMPLATES.VIEW = `./templates/view.template.ejs`;
const args = new ParseArgs().run();

settings[`package`] = `@html-widget/test`;
settings[`src`] = `test/temp/client-src`;

describe(`Test Command Create View`, function () {
    before(function () {
        if (FS.existsSync(`test/temp`)) FS.rmSync(`test/temp`, { recursive: true });
        FS.mkdirSync(`test/temp`);
    });

    after(function () {
        if (!args.flags[`no-clean`]) {
            if (FS.existsSync(`test/temp`)) FS.rmSync(`test/temp`, { recursive: true });
        }
    });

    describe(`Test Command Create View`, function () {
        before(function () {
            const commands = new Commands([`view`, `index`]);
            create(null, commands, args);
        });

        it(`creates directory client-src/@html-widget/test/index`, function () {
            const actual = FS.existsSync(`test/temp/client-src/@html-widget/test/index`);
            assert.ok(actual);
        });

        it(`injects import map into index.ejs`, function () {
            const text = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`);
            const actual = text.indexOf(`import_map.ejs`);
            assert.ok(actual != -1);
        });

        it(`injects templates into index.ejs`, function () {
            const text = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`);
            const actual = text.indexOf(`templates.ejs`);
            assert.ok(actual != -1);
        });
        
        it(`injects .mjs into .ejs`, function () {
            const text = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`);
            const actual = text.indexOf(`Index.mjs`);
            assert.ok(actual != -1);
        }); 

        it(`creates file body.ejs`, function () {
            const actual = FS.existsSync(`test/temp/client-src/@html-widget/test/index/body.ejs`);
            assert.ok(actual != -1);
        }); 

        it(`creates widget.info file`, function () {
            const actual = FS.existsSync(`test/temp/client-src/@html-widget/test/index/widget.info`);
            assert.ok(actual != -1);
        }); 

        describe(`Run the command again`, function () {
            before(function () {
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`, `not-modified`);

                const json = loadJSON(`test/temp/client-src/@html-widget/test/index/widget.info`);
                json.modified = "not-modified";
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/widget.info`, JSON.stringify(json, null, 2));

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`doesn't overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.scss`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite widget.info file`, function () {
                const actual = loadJSON(`test/temp/client-src/@html-widget/test/index/widget.info`).modified;
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });
        });  

        describe(`Remove widget.info file and run the command again`, function () {
            before(function () {
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/widget.info`, `not-modified`);

                FS.rmSync(`test/temp/client-src/@html-widget/test/index/widget.info`);

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`doesn't overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.scss`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`overwrite widget.info file`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/widget.info`).toString();
                const expected = `not-modified`;
                assert.notStrictEqual(actual, expected);
            });
        });

        describe(`Remove index.scss file and run the command again`, function () {
            before(function () {
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`, `not-modified`);

                const json = loadJSON(`test/temp/client-src/@html-widget/test/index/widget.info`);
                json.modified = "not-modified";
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/widget.info`, JSON.stringify(json, null, 2));

                FS.rmSync(`test/temp/client-src/@html-widget/test/index/index.scss`);

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`doesn't overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`overwrite index.scss`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.notStrictEqual(actual, expected);
            });

            it(`doesn't overwrite widget.info file`, function () {
                const actual = loadJSON(`test/temp/client-src/@html-widget/test/index/widget.info`).modified;
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });
        });        

        describe(`Remove index.ejs file and run the command again`, function () {
            before(function () {
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`, `not-modified`);

                const json = loadJSON(`test/temp/client-src/@html-widget/test/index/widget.info`);
                json.modified = "not-modified";
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/widget.info`, JSON.stringify(json, null, 2));

                FS.rmSync(`test/temp/client-src/@html-widget/test/index/index.ejs`);

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`doesn't overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.notStrictEqual(actual, expected);
            });

            it(`doesn't overwrite index.scss`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite widget.info file`, function () {
                const actual = loadJSON(`test/temp/client-src/@html-widget/test/index/widget.info`).modified;
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });
        });  

        describe(`Remove body.ejs file and run the command again`, function () {
            before(function () {
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`, `not-modified`);

                const json = loadJSON(`test/temp/client-src/@html-widget/test/index/widget.info`);
                json.modified = "not-modified";
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/widget.info`, JSON.stringify(json, null, 2));

                FS.rmSync(`test/temp/client-src/@html-widget/test/index/body.ejs`);

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`doesn't overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.notStrictEqual(actual, expected);
            });

            it(`doesn't overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.scss`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite widget.info file`, function () {
                const actual = loadJSON(`test/temp/client-src/@html-widget/test/index/widget.info`).modified;
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });
        });  
        describe(`Remove Index.mjs file and run the command again`, function () {
            before(function () {
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`, `not-modified`);
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`, `not-modified`);

                const json = loadJSON(`test/temp/client-src/@html-widget/test/index/widget.info`);
                json.modified = "not-modified";
                FS.writeFileSync(`test/temp/client-src/@html-widget/test/index/widget.info`, JSON.stringify(json, null, 2));

                FS.rmSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`);

                this.name = `index`;
                const commands = new Commands([`view`, this.name]);
                create(null, commands, args);
            });   

            it(`overwrite Index.mjs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/Index.mjs`).toString();
                const expected = `not-modified`;
                assert.notStrictEqual(actual, expected);
            });

            it(`doesn't overwrite body.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/body.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.ejs`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite index.scss`, function () {
                const actual = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.scss`).toString();
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });

            it(`doesn't overwrite widget.info file`, function () {
                const actual = loadJSON(`test/temp/client-src/@html-widget/test/index/widget.info`).modified;
                const expected = `not-modified`;
                assert.strictEqual(actual, expected);
            });
        }); 
    });
});
