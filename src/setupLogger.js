import Logger from "@thaerious/logger";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "./parseArgsOptions.js";
const args = new ParseArgs().loadOptions(parseArgsOptions).run();

const logger = Logger.getLogger();
logger.channel(`server`).enabled = true;
logger.channel(`standard`).enabled = true;
logger.channel(`verbose`).enabled = false;
logger.channel(`veryverbose`).enabled = false;
logger.channel(`debug`).enabled = false;
logger.channel(`warning`).enabled = true;
logger.channel(`error`).enabled = true;

logger.channel(`warning`).prefix = (f, l, o) => `* WARNING `;
logger.channel(`error`).prefix = (f, l, o) => `* ERROR `;

if (args.count(`silent`) > 0) logger.channel(`standard`).enabled = false;
if (args.count(`silent`) > 0) logger.channel(`warning`).enabled = false;
if (args.count(`verbose`) >= 1) logger.channel(`verbose`).enabled = true;
if (args.count(`verbose`) >= 2) logger.channel(`veryverbose`).enabled = true;
if (args.count(`verbose`) >= 3) logger.channel(`debug`).enabled = true;

const log = logger.all();
export {log as default, logger, args}
