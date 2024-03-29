import discover from "./discover.js";
import link from "./link.js";
import style from "./style.js";
import templates from "./templates.js";
import tree from "./tree.js";
import importmap from "./importmap.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

async function build (records, commands, args) {
    logger.channel(`verbose`).log(`# tree`);
    await tree(records);

    if (Object.keys(records).length === 0) {
        logger.channel(`verbose`).log(`# discover`);
        discover(records);
    }

    logger.channel(`verbose`).log(`# link`);
    await link(records);

    logger.channel(`verbose`).log(`# style`);
    style(records);

    logger.channel(`verbose`).log(`# import packages`);
    importmap(records);

    logger.channel(`verbose`).log(`# templates`);
    await templates(records);
}

export default build;
