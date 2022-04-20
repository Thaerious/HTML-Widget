import assert from "assert";
import seekComponents from "../src/seekComponents.js";



seekComponents("./test/mock/widgets");

// describe("Test Seek Components", function () {
//     describe("Single Directory", function () {
//         before(function (){
//             this.results = seekComponents("./mock/widgets");
//         });

//         it("finds component in root directory", function(){
//             // const actual = this.result["not-in-dir"];
//             // assert.ok(actual);
//         });

//         it("finds component in a subdirectory", function(){
//             // const actual = this.result["aspect-container"];
//             // assert.ok(actual);
//         });

//         it("finds component in a nested subdirectory", function(){
//             // const actual = this.result["widget-exists"];
//             // assert.ok(actual);
//         });
//     });
// });