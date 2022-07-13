#!/usr/bin/env node

import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";
import Logger from "@thaerious/logger";
import Server from "./Server.js";

const args = new ParseArgs().loadOptions(parseArgsOptions).run();
if (args.flags.cwd) process.chdir(args.flags.cwd);

const logger = Logger.getLogger();
logger.channel(`standard`).enabled = true;
logger.channel(`verbose`).enabled = false;
logger.channel(`very-verbose`).enabled = false;
logger.channel(`debug`).enabled = false;
logger.channel(`warning`).enabled = true;
logger.channel(`error`).enabled = true;
logger.channel(`warning`).prefix = (f, l, o) => `* WARNING `;

(async () => {
    const server = new Server();
    await server.init();
    server.start();
})();
