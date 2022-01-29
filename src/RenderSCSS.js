import sass from "sass";
import FS from "fs";
import Logger from "@thaerious/logger";
import Path from "path";
import CONSTANTS from "./constants.js";
const logger = Logger.getLogger();

function renderSCSS (record, outputPath, localPkg) {
    const result = sass.compile(
          record.package === localPkg
        ? record.style
        : Path.join(CONSTANTS.NODE_MODULES_PATH, record.package, record.style)
    )

    if (result){
        if (!FS.existsSync(outputPath)) FS.mkdirSync(Path.parse(outputPath).dir, { recursive: true });
        FS.writeFileSync(outputPath, result.css); 
    }
}

export default renderSCSS;
