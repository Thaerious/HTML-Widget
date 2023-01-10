import style from "./server/middleware/style.js";
import Server from "./server/Server.js"

const lib = {
    middleware: {
        style: style
    },
    Server : Server
}

export default lib;