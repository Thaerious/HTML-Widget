import assert from "assert";
import init from "../../src/commands/init.js";
import link from "../../src/commands/link.js";
import {init_all, clean_up, itHasFiles } from "./scripts/initTest.js";
import {fsjson} from "@thaerious/utility"

describe(`Test Command Init`, async function () {
    before(init_all);
    after(clean_up);

    describe(`Test Command Link`, function () {
        before(function () {
            init();
            link();
        });

        itHasFiles("www/linked/@mock/test");

        describe("the directory only requires a widget.info file with link field", function(){
            before(function(){
                fsjson.save("client-src/manual/widget.info", {link : "manual"});
                link();
            });

            itHasFiles("www/linked/manual");
        });

        describe("change the link value to change the resulting link target", function(){
            before(function(){
                fsjson.save("client-src/manual2/widget.info", {link : "ima-manual"});
                link();
            });

            itHasFiles("www/linked/ima-manual");
        });        
    });
});
