import assert from "assert";
import getFiles from "../src/getFiles.js";

describe("Test Get Files.js", function () {
    describe("Works with variable argument list", function () {
        before(function () {
            this.results = getFiles("./test/getFiles", { ".rev": [] }, ".ejs", ".mjs", ".css", ".bin");
        });

        it("has '.mjs' directory", function () {
            const actual = this.results[".mjs"];
            assert.ok(actual);
        });

        it("has '.ejs' directory", function () {
            const actual = this.results[".ejs"];
            assert.ok(actual);
        });

        it("has '.css' directory", function () {
            const actual = this.results[".css"];
            assert.ok(actual);
        });

        it("has '.bin' directory", function () {
            const actual = this.results[".bin"];
            assert.ok(actual);
        });

        it("keeps previous results categories, has '.rev'", function () {
            const actual = this.results[".mjs"];
            assert.ok(actual);
        });

        it("does not have a '.txt' directory", function () {
            const actual = !this.results[".txt"];
            assert.ok(actual);
        });

        it("has 'file.mjs'", function () {
            const actual = hasName(this.results, "file.mjs");
            assert.notStrictEqual(actual, -1);
        });

        it("has 'file.ejs'", function () {
            const actual = hasName(this.results, "file.ejs");
            assert.notStrictEqual(actual, -1);
        });

        it("has 'file.css'", function () {
            const actual = hasName(this.results, "file.css");
            assert.notStrictEqual(actual, -1);
        });
    });

    describe("Read root directory files", function () {
        before(function () {
            this.results = getFiles("./test/getFiles", { ".rev": [] }, [".ejs", ".mjs", ".css", ".bin"]);
            console.log(this.results);
        });

        describe("Reads files in vanilla structure", function () {
            it("has '.mjs' directory", function () {
                const actual = this.results[".mjs"];
                assert.ok(actual);
            });

            it("has '.ejs' directory", function () {
                const actual = this.results[".ejs"];
                assert.ok(actual);
            });

            it("has '.css' directory", function () {
                const actual = this.results[".css"];
                assert.ok(actual);
            });

            it("has '.bin' directory", function () {
                const actual = this.results[".bin"];
                assert.ok(actual);
            });

            it("keeps previous results categories, has '.rev'", function () {
                const actual = this.results[".mjs"];
                assert.ok(actual);
            });

            it("does not have a '.txt' directory", function () {
                const actual = !this.results[".txt"];
                assert.ok(actual);
            });

            it("has 'file.mjs'", function () {
                const actual = hasName(this.results, "file.mjs");
                assert.ok(actual);
            });

            it("has 'file.ejs'", function () {
                const actual = hasName(this.results, "file.ejs");
                assert.ok(actual);
            });

            it("has 'file.css'", function () {
                const actual = hasName(this.results, "file.css");
                assert.ok(actual);
            });

            it("has 'file1.mjs'", function () {
                const actual = hasName(this.results, "file1.mjs");
                assert.ok(actual);
            });

            it("has 'file1.ejs'", function () {
                const actual = hasName(this.results, "file1.ejs");
                assert.ok(actual);
            });

            it("has 'file1.css'", function () {
                const actual = hasName(this.results, "file1.css");
                assert.ok(actual);
            });

            it("'file1.mjs' is in 'sub1' directory", function () {
                const actual = getName(this.results, "file1.mjs").dir;
                assert.ok(actual, "test/getFiles/sub1");
            });
        });

        describe("Empty .nidgetrc input paramter", function () {
            it("does not have 'file2.mjs'", function () {
                const actual = !hasName(this.results, "file2.mjs");
                assert.ok(actual);
            });

            it("does not have 'file2.ejs'", function () {
                const actual = !hasName(this.results, "file2.ejs");
                assert.ok(actual);
            });

            it("does not have 'file2.css'", function () {
                const actual = !hasName(this.results, "file2.css");
                assert.ok(actual);
            });            
        });
        describe("Non-empy .nidgetrc input paramter (w/o local include)", function () {
            it("does not have 'file3.mjs'", function () {
                const actual = !hasName(this.results, "file3.mjs");
                assert.ok(actual);
            });

            it("does not have 'file3.ejs'", function () {
                const actual = !hasName(this.results, "file3.ejs");
                assert.ok(actual);
            });

            it("does not have 'file3.css'", function () {
                const actual = !hasName(this.results, "file3.css");
                assert.ok(actual);
            });            

            it("has 'file4.mjs'", function () {
                const actual = hasName(this.results, "file4.mjs");
                assert.ok(actual);
            });

            it("has 'file4.ejs'", function () {
                const actual = hasName(this.results, "file4.ejs");
                assert.ok(actual);
            });

            it("has 'file4.css'", function () {
                const actual = hasName(this.results, "file4.css");
                assert.ok(actual);
            });             
        });        
    });
});

function hasName(files, name) {
    for (const key of Object.keys(files)) {
        for (const entry of files[key]) {
            if (entry.base === name) return true;
        }
    }
    return false;
}

function getName(files, name) {
    for (const key of Object.keys(files)) {
        for (const entry of files[key]) {
            if (entry.base === name) return entry;
        }
    }
    return undefined;
}
