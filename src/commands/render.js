import { bfsObject } from "../bfsObject.js";
import extractSettings from "../extractSettings.js";
import getDependencies from "../getDependencies.js";
import renderEJS from "../RenderEJS.js";

async function render(records, commands, args){
    if (args.flags.all){
        for (const tagName in records){
            await doRender(records[tagName], records);
        }
    } else {
        const viewName = commands.nextCommand();
        const record = bfsObject(records, "tagName", viewName);
        if (!record) throw new Error(`Unknown view: ${viewName}`);    
        await doRender(record, records);
    }
}

async function doRender(record, records){
    const dependencies = getDependencies(record, records);
    await renderEJS(record, dependencies, extractSettings());      
}

export default render;