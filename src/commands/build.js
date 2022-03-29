import discover from "./discover.js";
import link_packages from "./link_packages.js";
import style from "./style.js";
import include from "./include.js";
import import_map from "./import_map.js";

async function build(records, commands, args){
    if (Object.keys(records).length == 0){
        discover(records);
    }
    
    link_packages(records);
    style(records);
    include(records);
    import_map(records);
}

export default build;