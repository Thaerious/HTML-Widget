import WidgetPreprocessor from "../src/WidgetPreprocessor.js";
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

describe("Test Widget Preprocessor", function () {
    describe("Sanity Tests", function () {
        it("Constructor sanity test", function () {
            new WidgetPreprocessor();
        });

        it("Add path sanity test", function () {
            const widgetPreprocessor = new WidgetPreprocessor();
            widgetPreprocessor.addPath("test/mock/**");
        });
    });

    describe("#process", function () {
        before(function () {
            this.widgetPreprocessor = new WidgetPreprocessor();
            this.widgetPreprocessor.addPath("./test/mock/**/*");
            this.widgetPreprocessor.addExclude("./test/mock/view/partials/*");
            this.widgetPreprocessor.addExclude("./**/_*.scss");
            this.widgetPreprocessor.process();
        });

        describe("has records for each widget & view in mock", function () {
            it(`has record for aspect-container`, function () {
                assert.strictEqual(true, this.widgetPreprocessor.hasRecord("aspect-container"));
            });

            it(`has record for player-container`, function () {
                assert.strictEqual(true, this.widgetPreprocessor.hasRecord("player-container"));
            });

            it(`has record for index view; files in different locations`, function () {
                assert.strictEqual(true, this.widgetPreprocessor.hasRecord("index"));
            });

            it(`has record for widget-element; which not in mock`, function () {
                assert.strictEqual(true, this.widgetPreprocessor.hasRecord("widget-element"));
            });

            it(`does not have record for google; it is in an excluded directory`, function () {
                assert.strictEqual(false, this.widgetPreprocessor.hasRecord("google"));
            });
        });

        describe("checking fields of records", function () {
            describe("widget-element", function () {                
                it(`is a widget`, function () {     
                    const record = this.widgetPreprocessor.getRecord("widget-element"); 
                    console.log(record);              
                    assert.strictEqual("widget", record.type);
                });
                it(`has a script`, function () {     
                    const record = this.widgetPreprocessor.getRecord("widget-element");               
                    assert.strictEqual(true, record.script !== undefined);
                });  
                it(`does not have a view`, function () {     
                    const record = this.widgetPreprocessor.getRecord("widget-element");               
                    assert.strictEqual(true, record.view === undefined);
                });
                it(`does not have a style`, function () {     
                    const record = this.widgetPreprocessor.getRecord("widget-element");               
                    assert.strictEqual(true, record.style === undefined);
                });                                              
            });
        });
    });
});
