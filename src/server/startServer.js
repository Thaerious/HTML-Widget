#!/usr/bin/env node
import Server from "./Server.js";

(async () => {
    const server = new Server();
    await server.init();
    server.start();
})();
