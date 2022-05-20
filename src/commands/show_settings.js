import settings from "../settings.js";
import Logger from "@thaerious/logger";
const logger = Logger.getLogger();

function showSettings (records, commands, args) {
    logger.channel(`show_settings`).log(settings);
}

export default showSettings;
