import NidgetPreprocessor from "./NidgetPreprocessor.js";
import extractSettings from "./extractSettings.js";
import renderEJS from "./RenderEJS.js";
import Lib from "./lib.js";
import Path from "path";
import FS from "fs";

function nppMiddleware(req, res){
    const url = Path.parse(req.originalUrl);

    new Lib().go();

    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.buildRecords();
    npp.loadLibs();
    npp.ejs();
    npp.sass();
    npp.copyMJS(true);
    
    renderEJS(npp.getRecord(url.name), npp.settings);
    
    const record = npp.getRecord(url.name);
    const html = FS.readFileSync(record.html);

    res.set('Content-Type', 'text/html');
    res.send(html);
    res.end();
}

export default nppMiddleware;