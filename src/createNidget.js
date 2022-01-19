import Path from "path";
import FS from "fs";
import CONSTANTS from "./constants.js";
import NidgetPreprocessor from "./NidgetPreprocessor.js";

function createNidget (name) {
    // const dashName = NidgetPreprocessor.convertToDash(name);
    // const underscoreName = dashName.replace(/-+/g, `_`); // replace underscore with dash
    // const pascalName = convertToPascal(dashName);

    console.log(name);
    // console.log(dashName);
    // console.log(underscoreName);
    // console.log(pascalName);

    // const moduleLocation = Path.join(".", CONSTANTS.MODULE_NAME);
}

function convertToPascal (string) {
    return string.replace(/-([A-Z])+/g, v => v.toUpperCase()); // replace underscore with dash
}

createNidget(process.argv[2]);
