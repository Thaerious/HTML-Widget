import assert from "assert";
import nidgetCli from "@nidget/core";

describe("Test ...", function () {
    before(async function(){
        this.result = await nidgetCli(["disc"]);
    });

    it("has vanilla nidget", function() {
        const expected = "nidget";
        const actual = this.result["aspect-container"];
        assert.strictEqual(expected, actual);
    });

    it("just mjs file not in subdirectory", function() {
        const expected = "nidget";
        const actual = this.result["not-in-dir"];
        assert.strictEqual(expected, actual);
    });

    it("has vanilla view", function() {
        const expected = "view";
        const actual = this.result["index"];
        assert.strictEqual(expected, actual);
    });

    it("empty src array ignores sub-directory", function() {
        const actual = this.result["ignored"];
        assert.ok(!actual);
    });

    it("absent src array does not ignore sub-directory", function() {
        const actual = this.result["notignored"];
        assert.ok(actual);
    });

    it("custom path nested subdirectory exists", function() {
        const actual = this.result["nidget-exists"];
        assert.ok(actual);
    });

    it("custom path nested subdirectory doesn't exist", function() {
        const actual = this.result["nidget-not-exists"];
        assert.ok(!actual);
    });
});