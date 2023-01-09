import discover from "../discover.js";
import seekFiles from "@thaerious/utility/src/seekfiles.js";
import { compileSASS } from "../server/middleware/style.js";
import CONST from "../const.js";
import Path from "path";

/**
 * Compile sass files into css files and place then into
 * the component and view output directories.
 */
function style(records, commands, args) {
    if (Object.keys(records).length === 0) {
        discover(records);
    }

    for (const name in records) {
        const record = records[name];
        const src = Path.join(
            record.type == "view" ? CONST.DIR.VIEWS : CONST.DIR.COMPONENTS,
            record.name,
            record.name + CONST.EXT.SCSS
        );
        const dest = Path.join(
            CONST.DIR.COMPILED,
            record.name,
            record.name + CONST.EXT.CSS
        );
        console.log(src);
        console.log(dest);
        compileSASS(src, dest); 
    }
}

export default style;
