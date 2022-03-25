import FS from "fs";
import Path from "path";
import Logger from "@thaerious/logger";
import CONSTANTS from "../constants.js";
import loadJSON from "../loadJSON.js";
const logger = Logger.getLogger();

function init(records, commands, args) {
    if (commands.hasNext() && records[commands.peekCommand()]) {
        console.log(records[commands.nextCommand()])
    } else {
        for (const tagname in records) {
            console.log(records[tagname]);
        }
    }
}

export default init;
