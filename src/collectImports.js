import FS from "fs";
import { Parser } from "acorn";
import { bfsAll } from "./bfsObject.js";

function seekJSDependencies(filename) {
    if (filename == '' || !filename) return [];
    if (!FS.existsSync(filename)) return [];

    const dependencies = [];

    const code = FS.readFileSync(filename);
    const ast = Parser.parse(code, { ecmaVersion: `latest`, sourceType: `module` });
    const importDeclarations = bfsAll(ast, `type`, `ImportDeclaration`);

    for (const declaration of importDeclarations){
        for (const specifier of declaration.specifiers){
            dependencies.push({
                className : specifier.imported ? specifier.imported.name : specifier.local.name, 
                packageName : declaration.source.value
            });
        }
    }

    return dependencies;
}

export default seekJSDependencies;
