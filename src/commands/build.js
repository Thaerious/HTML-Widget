import discover from "./discover.js";
import link from "./link.js";
import style from "./style.js";
import include from "./include.js";
import import_packages from "./import_packages.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();


async function build(records, commands, args){
    if (Object.keys(records).length == 0){
        logger.channel(`verbose`).log(`# discover`);
        discover(records);
    }
    
    logger.channel(`verbose`).log(`# link`);
    await link(records);

    logger.channel(`verbose`).log(`# style`);
    style(records);

    logger.channel(`verbose`).log(`# import packages`);
    import_packages(records);    

    logger.channel(`verbose`).log(`# include`);
    await include(records);
}

export default build;