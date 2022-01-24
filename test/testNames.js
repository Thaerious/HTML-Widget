import { convertToDash, convertToPascal, convertToCamel } from "../src/names.js";
import assert from "assert";

describe("Test Convert Names", function () {
    describe("dash-delimited", function(){
        it("captials get a dash and changed to lowercase", ()=>{
            const actual = convertToDash("firstSecondThird");
            const expected = "first-second-third";
            assert.strictEqual(actual, expected);
        });
        it("all letters following a dash become lowercase", ()=>{
            const actual = convertToDash("First-Second");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        });
        it("leading capitals do not get a dash", ()=>{
            const actual = convertToDash("FirstSecond");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        });
        it("leading dashes are removed", ()=>{
            const actual = convertToDash("-FirstSecond");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        });
        it("multiple dashes are reduced to one", ()=>{
            const actual = convertToDash("--First---Second");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        });   
        it("underscores become dashes", ()=>{
            const actual = convertToDash("First_Second");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        });  
        it("multiple underscores become single dashes", ()=>{
            const actual = convertToDash("First__Second");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        });  
        it("leading underscores are removed", ()=>{
            const actual = convertToDash("_First_Second");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        }); 
        it("leading mulitiple underscores are removed", ()=>{
            const actual = convertToDash("__First__Second");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        });           
        it("mixed underscore and capilization", ()=>{
            const actual = convertToDash("First_SecondThird");
            const expected = "first-second-third";
            assert.strictEqual(actual, expected);
        });                                          
        it("spaces become dashes", ()=>{
            const actual = convertToDash("First Second");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        });  
        it("multiple spaces become single dashes", ()=>{
            const actual = convertToDash("First  Second");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        });  
        it("leading spaces are removed", ()=>{
            const actual = convertToDash(" First Second");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        }); 
        it("leading mulitiple are removed", ()=>{
            const actual = convertToDash("  First  Second");
            const expected = "first-second";
            assert.strictEqual(actual, expected);
        });           
        it("mixed spaces, underscores and capilization", ()=>{
            const actual = convertToDash("First_SecondThird Fourth");
            const expected = "first-second-third-fourth";
            assert.strictEqual(actual, expected);
        });
        it("paths only use the final part", ()=>{
            const actual = convertToDash("one/two/threeFour");
            const expected = "three-four";
            assert.strictEqual(actual, expected);
        });   
        it("paths remove extensions", ()=>{
            const actual = convertToDash("one/two/threeFour.js");
            const expected = "three-four";
            assert.strictEqual(actual, expected);
        });               
    });

    describe("PascalCase", function(){
        it("first letter gets capitalized", ()=>{
            const actual = convertToPascal("firstSecondThird");
            const expected = "FirstSecondThird";
            assert.strictEqual(actual, expected);
        });        
        it("all letters following a dash become uppercase", ()=>{
            const actual = convertToPascal("first-second");
            const expected = "FirstSecond";
            assert.strictEqual(actual, expected);
        });
        it("leading dashes are removed", ()=>{
            const actual = convertToPascal("-FirstSecond");
            const expected = "FirstSecond";
            assert.strictEqual(actual, expected);
        });
        it("multiple dashes are removed", ()=>{
            const actual = convertToPascal("--First---Second");
            const expected = "FirstSecond";
            assert.strictEqual(actual, expected);
        });   
        it("underscores are removed", ()=>{
            const actual = convertToPascal("_First_Second");
            const expected = "FirstSecond";
            assert.strictEqual(actual, expected);
        });  
        it("multiple underscores are removed", ()=>{
            const actual = convertToPascal("First__Second");
            const expected = "FirstSecond";
            assert.strictEqual(actual, expected);
        });  
        it("spaces are removed", ()=>{
            const actual = convertToPascal(" First  Second ");
            const expected = "FirstSecond";
            assert.strictEqual(actual, expected);
        });                 
        it("mixed spaces, underscores, dashes and capilization", ()=>{
            const actual = convertToPascal("-First_SecondThird  Fourth");
            const expected = "FirstSecondThirdFourth";
            assert.strictEqual(actual, expected);
        });
        it("paths only use the final part", ()=>{
            const actual = convertToPascal("one/two/threeFour");
            const expected = "ThreeFour";
            assert.strictEqual(actual, expected);
        });   
        it("paths remove extensions", ()=>{
            const actual = convertToPascal("one/two/threeFour.js");
            const expected = "ThreeFour";
            assert.strictEqual(actual, expected);
        });                       
    });

    describe("camelCase", function(){
        it("first letter does not get capitalized", ()=>{
            const actual = convertToCamel("firstSecondThird");
            const expected = "firstSecondThird";
            assert.strictEqual(actual, expected);
        });        
        it("all letters following a dash become uppercase", ()=>{
            const actual = convertToCamel("first-second");
            const expected = "firstSecond";
            assert.strictEqual(actual, expected);
        });
        it("leading dashes are removed", ()=>{
            const actual = convertToCamel("-FirstSecond");
            const expected = "firstSecond";
            assert.strictEqual(actual, expected);
        });
        it("multiple dashes are removed", ()=>{
            const actual = convertToCamel("--First---Second");
            const expected = "firstSecond";
            assert.strictEqual(actual, expected);
        });   
        it("underscores are removed", ()=>{
            const actual = convertToCamel("_First_Second");
            const expected = "firstSecond";
            assert.strictEqual(actual, expected);
        });  
        it("multiple underscores are removed", ()=>{
            const actual = convertToCamel("First__Second");
            const expected = "firstSecond";
            assert.strictEqual(actual, expected);
        });  
        it("spaces are removed", ()=>{
            const actual = convertToCamel(" First  Second ");
            const expected = "firstSecond";
            assert.strictEqual(actual, expected);
        });                 
        it("mixed spaces, underscores, dashes and capilization", ()=>{
            const actual = convertToCamel("-First_SecondThird  Fourth");
            const expected = "firstSecondThirdFourth";
            assert.strictEqual(actual, expected);
        });
        it("paths only use the final part", ()=>{
            const actual = convertToCamel("one/two/threeFour");
            const expected = "threeFour";
            assert.strictEqual(actual, expected);
        });   
        it("paths remove extensions", ()=>{
            const actual = convertToCamel("one/two/threeFour.js");
            const expected = "threeFour";
            assert.strictEqual(actual, expected);
        });                       
    });    
});