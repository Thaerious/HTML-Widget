import discover from "./discover.js";
import link_packages from "./link_packages.js";
import style from "./style.js";
import include from "./include.js";
import import_map from "./import_map.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();


async function build(records, commands, args){
    if (Object.keys(records).length == 0){
        logger.channel(`verbose`).log(`# discover`);
        discover(records);
    }
    
    logger.channel(`verbose`).log(`# link packages`);
    link_packages(records);

    logger.channel(`verbose`).log(`# style`);
    style(records);

    logger.channel(`verbose`).log(`# import map`);
    import_map(records);    

    logger.channel(`verbose`).log(`# include`);
    include(records);
}

export default build;