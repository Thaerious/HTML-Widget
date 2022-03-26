import Logger from "@thaerious/logger";
import extractSettings from "../extractSettings.js";
const logger = Logger.getLogger();

function settings(records, commands, args) {
    console.log(extractSettings());
}

export default settings;