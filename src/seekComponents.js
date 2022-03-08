import Path from "path";
import seekFiles from "./seekFiles.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

/**
 * Retrieves an object of records pointing to valid components.
 * Each object key is a component name, each value the record.
 * Only the first component found with a given name is recorded.
 * The names must consist of two words, valid styles are:
 *     a-component
 *     aComponent
 *     a_component
 * 
 * A valid component is a sub class of NidgetElement.
 */
async function seekComponents(...rootDirectories){
    Logger.getLogger().channel(`debug`).log(`#seekComponents`);
    const files = [];
    
    for (const root of rootDirectories.flat()){
        Logger.getLogger().channel(`debug`).log(`\\_ ${root}`);
        seekFiles(root, ".mjs", files); 
    }

    for (const file of files){
        console.log(file);
        const { default: Component } = await import("/test/mock/nidgets/aspect-container/AspectContainer.mjs");
        // const component = new Component();
        // console.log(component);
    }
}

export default seekComponents;