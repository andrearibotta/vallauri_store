"use strict"

module.exports = function enforceWriteContentType(roules = []){
    const writeMethod = ["POST","PUT","PATCH"];
    return(req,res,next) =>{
        if(!writeMethod.includes(req.method)) return next();

        const ct = (req.headers["content-type"] || "").toLowerCase();
        const roule = roules.find(r => req.path.startsWith(r.path));
        if(!roule) return next();
        if(!ct.includes(roule.type)) {
            return res.status(415).json({
                error: "Unsupported Media Type",
                expected: roule.type,
                received: ct || "nessuno",
                requestId: req.id
            })
        }
        next();
    }
}