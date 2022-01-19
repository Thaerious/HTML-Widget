import collectImports from "../src/collectImports";
import assert from "assert";

describe("Test Seek JS Dependencies", function () {
    describe("Default.js", function () {
        it("returns five indentifiers", function () {
            const result = collectImports("./test/scripts/Default.js");
            assert.strictEqual(5, result.length);
        });

        describe("default import", function () {
            it("the className matches", function () {
                const result = collectImports("./test/scripts/Default.js");
                assert.strictEqual("ParentClass", result[0].className);
            });
            it("the packageName matches", function () {
                const result = collectImports("./test/scripts/Default.js");
                assert.strictEqual("@maintainer/package", result[0].packageName);
            });
        });

        describe("specified import", function () {
            it("the className matches", function () {
                const result = collectImports("./test/scripts/Default.js");
                assert.strictEqual("AnotherClass", result[1].className);
            });
            it("the packageName matches", function () {
                const result = collectImports("./test/scripts/Default.js");
                assert.strictEqual("@another/package", result[1].packageName);
            });
        });

        describe("renamed import", function () {
            it("the className matches", function () {
                const result = collectImports("./test/scripts/Default.js");
                assert.strictEqual("ThirdClass", result[2].className);
            });
            it("the packageName matches", function () {
                const result = collectImports("./test/scripts/Default.js");
                assert.strictEqual("@third/package", result[2].packageName);
            });
        });

        describe("multiple imports #1 ", function () {
            it("the className matches", function () {
                const result = collectImports("./test/scripts/Default.js");
                assert.strictEqual("multi1", result[3].className);
            });
            it("the packageName matches", function () {
                const result = collectImports("./test/scripts/Default.js");
                assert.strictEqual("multiples", result[3].packageName);
            });
        });  
        
        describe("multiple imports #2 ", function () {
            it("the className matches", function () {
                const result = collectImports("./test/scripts/Default.js");
                assert.strictEqual("multi2", result[4].className);
            });
            it("the packageName matches", function () {
                const result = collectImports("./test/scripts/Default.js");
                assert.strictEqual("multiples", result[4].packageName);
            });
        });          
        
    });
});
