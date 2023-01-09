import { Server } from "@html-widget/core";
import ParseArgs from "@thaerious/parseargs";
import dotenv from "dotenv";

dotenv.config();

(async () => {
    const args = new ParseArgs().run();    
    const port = args.flags["port"];
    const server = new Server();
    await server.init();
    server.start(port);
})()