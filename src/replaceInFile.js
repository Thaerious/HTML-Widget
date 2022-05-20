import FS from "fs";

function replaceInFile (filename, search, replace) {
    const text = FS.readFileSync(filename, `utf-8`);
    const newText = text.replaceAll(search, replace);
    FS.writeFileSync(filename, newText);
}

export default replaceInFile;
