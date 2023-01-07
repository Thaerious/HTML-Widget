#!/usr/bin/env node
import Server from "./Server.js";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "../parseArgsOptions.js";

const args = new ParseArgs().loadOptions(parseArgsOptions).run();

(async () => {
    const server = new Server();
    await server.init();
    server.start(args.flags.port ?? 8000);
})();
