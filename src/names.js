import Path from "path";

function convertDelimited (string, delimiter = `-`) {
    string = string.trim();
    string = Path.parse(string).name;
    string = string.charAt(0).toLocaleLowerCase() + string.substr(1); // leading lower case
    string = string.replace(/[_ -]+/g, delimiter); // replace common delimeters with declared delimiter

    const r1 = RegExp(`[${delimiter}]([A-Z]+)`, `g`);
    string = string.replace(r1, `$1`); // normalize delimiter-capital to capital

    string = string.replace(/([A-Z]+)/g, `${delimiter}$1`).toLowerCase(); // change all upper to lower and add a dash

    const r2 = RegExp(`^[${delimiter}]+`);
    string = string.replace(r2, ``); // remove leading delimiters

    return string;
}

function convertToDash (string) {
    return convertDelimited(string, `-`);
}

function convertToPascal (string) {
    string = convertToDash(string);
    string = string.replace(/(-[a-z])+/g, v => v.toUpperCase()); // replace dash with nothing, letter preceeding to uppercase
    string = string.replace(/-+/g, ``); // remove dashes
    string = string.charAt(0).toUpperCase() + string.substr(1);
    return string;
}

function convertToCamel (string) {
    string = convertToDash(string);
    string = string.replace(/(-[a-z])+/g, v => v.toUpperCase()); // replace dash with nothing, letter preceeding to uppercase
    string = string.replace(/-+/g, ``); // remove dashes
    string = string.charAt(0).toLowerCase() + string.substr(1);
    return string;
}

export { convertToDash, convertToPascal, convertToCamel, convertDelimited };
