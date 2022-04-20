import assert from "assert";
import ParseArgs from "@thaerious/parseargs";
import FS from "fs";
import init from "../src/commands/init.js";
import { Commands } from "../src/cli.js";

import CONSTANTS from "../src/constants.js";
import settings from "../src/settings.js";
import loadJSON from "../src/loadJSON.js";

CONSTANTS.TEMPLATES.VIEW = `./templates/view.template.ejs`;
const args = new ParseArgs().run();

settings[`package`] = `@html-widget/test`;

describe(`Test Command Create View`, function () {
    before(function () {
        // clean and/or create test directory
        if (FS.existsSync(`test/temp`)) FS.rmSync(`test/temp`, { recursive: true });
        FS.mkdirSync(`test/temp`);
        process.chdir(`test/temp`);
    });

    after(function () {
        if (!args.flags[`no-clean`]) {
            // clean up test directory unless --no-clean is specified
            if (FS.existsSync(`test/temp`)) FS.rmSync(`test/temp`, { recursive: true });            
        } else {
            console.log("\n *** see test directory: test/temp");
        }
    });

    describe(`Test Command Init`, function () {
        before(function () {
            // run the command
            const commands = new Commands([`view`, `index`]);
            init(null, commands, args);
        });

        it(`creates the 'client-src' directory`, function () {
            const actual = FS.existsSync(`client-src/@html-widget/test/`);
            assert.ok(actual);
        });

        it(`creates the '.widgetrc' file in the root directory`, function () {
            const actual = FS.existsSync(`.widgetrc`);
            assert.ok(actual);
        });        

        it(`creates the '.widgetinfo' file in the package source directory`, function () {
            const actual = FS.existsSync(`client-src/@html-widget/test/widget.info`);
            assert.ok(actual);
        });        

        it(`'.widgetinfo' has the link key with package name value`, function () {
            const json = loadJSON(`client-src/@html-widget/test/widget.info`);
            const actual = json.link;
            const expected = "@html-widget/test";
            assert.ok(actual);
        }); 

        describe('Run the init command again', function() {
            before(function () {
                // mark the .widgetrc file
                const widgetrc = loadJSON(`.widgetrc`);
                widgetrc.modified = "not-modified";
                FS.writeFileSync(`.widgetrc`, JSON.stringify(widgetrc, null, 2));                

                // mark the .widgetinfo file
                const widgetinfo = loadJSON(`client-src/@html-widget/test/widget.info`);
                widgetinfo.modified = "not-modified";
                FS.writeFileSync(`client-src/@html-widget/test/widget.info`, JSON.stringify(widgetinfo, null, 2));    

                // run the command
                const commands = new Commands([`view`, `index`]);
                init(null, commands, args);
            });           

            it(`does not create a new .widgetrc file`, function () {
                const json = loadJSON(`.widgetrc`);
                const actual = json.modified;
                const expected = "not-modified";
                assert.strictEqual(actual, expected);
            });  
            
            it(`does not create a new .widgetinfo file`, function () {
                const json = loadJSON(`client-src/@html-widget/test/widget.info`);
                const actual = json.modified;
                const expected = "not-modified";
                assert.strictEqual(actual, expected);
            });   
        });
            
        describe(`Delete the .widgetrc file and run the init command again`, function() {
            before(function () {
                // mark the .widgetrc file
                FS.rmSync(`.widgetrc`);

                // run the command
                const commands = new Commands([`view`, `index`]);
                init(null, commands, args);
            });     
            
            it(`creates the '.widgetinfo' file in the package source directory`, function () {
                const actual = FS.existsSync(`client-src/@html-widget/test/widget.info`);
                assert.ok(actual);
            });                
        });

        describe(`Delete the 'client-src' directory and run the init command again`, function() {
            before(function () {
                // mark the .widgetrc file
                FS.rmSync(`client-src`, {recursive : true});

                // run the command
                const commands = new Commands([`view`, `index`]);
                init(null, commands, args);
            });     
            
            it(`creates the '.widgetrc' file in the root directory`, function () {
                const actual = FS.existsSync(`.widgetrc`);
                assert.ok(actual);
            });               
        });        

        // it(`injects templates into index.ejs`, function () {
        //     const text = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`);
        //     const actual = text.indexOf(`templates.ejs`);
        //     assert.ok(actual != -1);
        // });
        
        // it(`injects .mjs into .ejs`, function () {
        //     const text = FS.readFileSync(`test/temp/client-src/@html-widget/test/index/index.ejs`);
        //     const actual = text.indexOf(`Index.mjs`);
        //     assert.ok(actual != -1);
        // }); 

        // it(`creates file body.ejs`, function () {
        //     const actual = FS.existsSync(`test/temp/client-src/@html-widget/test/index/body.ejs`);
        //     assert.ok(actual != -1);
        // }); 

        // it(`creates widget.info file`, function () {
        //     const actual = FS.existsSync(`test/temp/client-src/@html-widget/test/index/widget.info`);
        //     assert.ok(actual != -1);
        // }); 
    });
});
