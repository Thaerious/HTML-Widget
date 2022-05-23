import FS from "fs";

function replaceInFile (filename, search, replace) {
    const oldText = FS.readFileSync(filename, `utf-8`);
    const newText = oldText.replaceAll(search, replace);
    FS.writeFileSync(filename, newText);
}

export default replaceInFile;
