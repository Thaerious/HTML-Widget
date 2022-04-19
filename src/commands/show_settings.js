import settings from "../settings.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

function show_settings(records, commands, args) {
    logger.channel(`show_settings`).log(settings);
}

export default show_settings;