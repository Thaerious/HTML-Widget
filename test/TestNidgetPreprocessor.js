import NidgetPreprocessor from "../src/NidgetPreprocessor.js";
import assert from "assert";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../src/parseArgsOptions.js";
import Logger from "@thaerious/logger";

const args = new ParseArgs().loadOptions(parseArgsOptions).run();
const logger = Logger.getLogger();

logger.channel(`standard`).enabled = true;
logger.channel(`verbose`).enabled = false;
logger.channel(`very-verbose`).enabled = false;
logger.channel(`debug`).enabled = false;

if (args.count(`silent`) > 0) logger.channel(`standard`).enabled = false;
if (args.count(`verbose`) >= 1) logger.channel(`verbose`).enabled = true;
if (args.count(`verbose`) >= 2) logger.channel(`very-verbose`).enabled = true;
if (args.count(`verbose`) >= 3) logger.channel(`debug`).enabled = true;

describe("Test Nidget Preprocessor", function () {
    describe("Sanity Tests", function () {
        it("Constructor sanity test", function () {
            new NidgetPreprocessor();
        });

        it("Add path sanity test", function () {
            const nidgetPreprocessor = new NidgetPreprocessor();
            nidgetPreprocessor.addPath("test/mock/**");
        });
    });

    describe("#process", function () {
        before(function () {
            this.nidgetPreprocessor = new NidgetPreprocessor();
            this.nidgetPreprocessor.addPath("./test/mock/**/*");
            this.nidgetPreprocessor.addExclude("./test/mock/view/partials/*");
            this.nidgetPreprocessor.addExclude("./**/_*.scss");
            this.nidgetPreprocessor.process();
        });

        describe("has records for each nidget & view in mock", function () {
            it(`has record for aspect-container`, function () {
                assert.strictEqual(true, this.nidgetPreprocessor.hasRecord("aspect-container"));
            });

            it(`has record for player-container`, function () {
                assert.strictEqual(true, this.nidgetPreprocessor.hasRecord("player-container"));
            });

            it(`has record for index view; files in different locations`, function () {
                assert.strictEqual(true, this.nidgetPreprocessor.hasRecord("index"));
            });

            it(`has record for nidget-element; which not in mock`, function () {
                assert.strictEqual(true, this.nidgetPreprocessor.hasRecord("nidget-element"));
            });

            it(`does not have record for google; it is in an excluded directory`, function () {
                assert.strictEqual(false, this.nidgetPreprocessor.hasRecord("google"));
            });
        });

        describe("checking fields of records", function () {
            describe("nidget-element", function () {                
                it(`is a nidget`, function () {     
                    const record = this.nidgetPreprocessor.getRecord("nidget-element"); 
                    console.log(record);              
                    assert.strictEqual("nidget", record.type);
                });
                it(`has a script`, function () {     
                    const record = this.nidgetPreprocessor.getRecord("nidget-element");               
                    assert.strictEqual(true, record.script !== undefined);
                });  
                it(`does not have a view`, function () {     
                    const record = this.nidgetPreprocessor.getRecord("nidget-element");               
                    assert.strictEqual(true, record.view === undefined);
                });
                it(`does not have a style`, function () {     
                    const record = this.nidgetPreprocessor.getRecord("nidget-element");               
                    assert.strictEqual(true, record.style === undefined);
                });                                              
            });
        });
    });
});
