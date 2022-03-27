#!/usr/bin/env node

import ParseArgs from "@thaerious/parseargs";
import Logger from "@thaerious/logger";

class Commands {
    /**
     * @param commandStack An array to use for the command stack.
     */
    constructor(commandStack) {
        this.commandStack = commandStack;
        this._prev = [];
    }

    nextCommand() {
        if (this.commandStack.length === 0) throw "command parse error: empty command stack";
        this._prev.unshift(this.commandStack.shift().toLowerCase());
        return this._prev[0].replaceAll("-", "_");
    }

    hasNext() {
        return this.commandStack.length > 0;
    }

    peekCommand() {
        return this.commandStack[0].toLowerCase();
    }

    get prev() {
        return this._prev[0];
    }
}

const parseArgsOptions = {
    flags: [
        {
            long: `verbose`,
            short: `v`,
            type: `boolean`,
        },
        {
            long: `name`,
            short: `n`,
            type: `string`,
        },
        {
            long: `output`,
            short: `o`,
            type: `string`,
        },
        {
            long: `input`,
            short: `i`,
            type: `string`,
        },
        {
            long: `dest`,
            short: `d`,
            type: `string`,
        },
    ],
};

const logger = Logger.getLogger();
logger.channel(`standard`).enabled = true;
logger.channel(`verbose`).enabled = false;
logger.channel(`very-verbose`).enabled = false;
logger.channel(`debug`).enabled = false;
logger.channel(`warning`).enabled = true;

logger.channel(`warning`).prefix = (f, l, o) => `* WARNING `;

// logger.channel(`very-verbose`).prefix = (f, l, o)=>`${f} ${l} `;

const args = new ParseArgs().loadOptions(parseArgsOptions).run();
if (args.count(`silent`) > 0) logger.channel(`standard`).enabled = false;
if (args.count(`silent`) > 0) logger.channel(`warning`).enabled = false;
if (args.count(`verbose`) >= 1) logger.channel(`verbose`).enabled = true;
if (args.count(`verbose`) >= 2) logger.channel(`very-verbose`).enabled = true;
if (args.count(`verbose`) >= 3) logger.channel(`debug`).enabled = true;

let commands;

logger.channel(`verbose`).log(`Nidget command line interface`);

(async () => {
    try {
        const rvalue = await nidgetCli(args.args);
    } catch (err) {
        if (err.code === "ERR_MODULE_NOT_FOUND") {
            logger.channel(`standard`).log(`unknown command : ${commands.prev}`);
            logger.channel(`verbose`).log(err);
        } else {
            console.log("ERROR");
            console.log(err);
        }
    }
})();

async function nidgetCli(commandStack) {
    let started = false; // so that we can burn through the node part of the command line
    let rvalue;
    let records = {};
    commands = new Commands(commandStack);

    while (commandStack.length > 0) {
        const module = `./commands/${commands.nextCommand()}.js`;
        logger.channel(`debug`).log(` -- ${module}`);
        if (module.endsWith("nidget.js") || module.endsWith("nidgetcli.js")) {
            logger.channel(`debug`).log(` -- started`);
            started = true;
            continue;
        }

        if (!started) {
            continue;
        }

        const { default: command } = await import(module);
        logger.channel(`verbose`).log(`# ${commands.prev}`);
        rvalue = await command(records, commands, args);
        logger.channel("very-verbose").log(`uptime ${process.uptime()} s`);
    }

    return rvalue;
}

export default nidgetCli;
