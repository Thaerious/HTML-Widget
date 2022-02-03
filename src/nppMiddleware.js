import NidgetPreprocessor from "./NidgetPreprocessor.js";
import extractSettings from "./extractSettings.js";
import renderEJS from "./RenderEJS.js";
import Path from "path";
import FS from "fs";

function nppMiddleware(req, res){
    const url = Path.parse(req.originalUrl);

    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.addModules();
    npp.buildRecords();
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