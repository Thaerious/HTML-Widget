#!/usr/bin/env node

import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "./parseArgsOptions.js";
const args = new ParseArgs().loadOptions(parseArgsOptions).run();
if (args.flags.cwd) process.chdir(args.flags.cwd);

import logger from "./setupLogger.js";

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
        return this._prev[0];
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

let commands;

logger.channel(`verbose`).log(`Widget command line interface`);

(async () => {
    try {
        const rvalue = await cli(args.args);
    } catch (err) {
        if (err.code === "ERR_MODULE_NOT_FOUND") {
            logger.channel(`standard`).log(`unknown command : ${commands.prev}`);
            logger.channel(`verbose`).log(err);
        } else {
            logger.channel(`error`).log("ERROR");
            console.log(err);
        }
    }
})();

async function cli(commandStack) {
    let started = false; // so that we can burn through the node part of the command line
    let rvalue;
    let records = {};
    commands = new Commands(commandStack);

    while (commandStack.length > 0) {
        const module = `./commands/${commands.nextCommand().replaceAll("-", "_")}.js`;
        logger.channel(`debug`).log(` -- ${module}`);

        if (module.endsWith("widget.js") || module.endsWith("cli.js")) {
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

export {cli, Commands}
