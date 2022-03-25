import getDependencies from "../getDependencies.js";

function injectTemplates(req, res){
    const url = Path.parse(req.originalUrl);

    const npp = new NidgetPreprocessor();
    npp.applySettings(extractSettings());
    npp.discover();
    npp.loadLibs();
    npp.sass();
    npp.copyMJS(true);
    npp.ejs();
    
    renderEJS(npp.getRecord(url.name), npp.settings);
    
    const record = npp.getRecord(url.name);
    const path = npp.settings['output-dir'] + "/" + record.package + "/" + record.html;
    const html = FS.readFileSync(path);

    res.set('Content-Type', 'text/html');
    res.send(html);
    res.end();
}

export default injectTemplates;