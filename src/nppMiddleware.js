import Path from "path";
import discover from "./commands/discover.js";
import build from "./commands/build.js";
import CONSTANTS from "./constants.js";
import ParseArgs from "@thaerious/parseargs";
import parseArgsOptions from "./parseArgsOptions.js";

const args = new ParseArgs().loadOptions(parseArgsOptions).run();

function nppMiddleware(req, res, next){
    const url = Path.parse(req.originalUrl);   

    const records = {};
    discover(records);

    if (records[url.name]){
        const record = records[url.name];
        if (record.type == CONSTANTS.TYPE.VIEW){
            console.log(record);
            build({});
        }
    }

    next();
}

export default nppMiddleware;