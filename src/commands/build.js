import discover from "./discover.js";
import script from "./script.js";
import style from "./style.js";
import include from "./include.js";
import link from "./link.js";

async function build(records, commands, args){
    discover(records, commands, args);
    script(records, commands, args);
    style(records, commands, args);
    include(records, commands, args);
    link(records, commands, args);
}

export default build;