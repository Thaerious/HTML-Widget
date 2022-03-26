import discover from "./discover.js";
import link_packages from "./link_packages.js";
import style from "./style.js";
import include from "./include.js";
import script from "./script.js";

async function build(records, commands, args){
    discover(records, commands, args);
    link_packages(records, commands, args);
    style(records, commands, args);
    include(records, commands, args);
    script(records, commands, args);
}

export default build;