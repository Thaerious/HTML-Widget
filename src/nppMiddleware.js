import Path from "path";

function nppMiddleware(req, res){
    const url = Path.parse(req.originalUrl);
}

export default nppMiddleware;