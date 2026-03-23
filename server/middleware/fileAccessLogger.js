const path = require("path");
const createLogger = require("../lib/fileLogger");

module.exports = function fileAccessLogger(logPath){
    const logger = createLogger(
        logPath || path.join(__dirname,"...","log","accesso.log")
    )
    return(req,res,next) =>{
        const start = Date.now();

        logger.info(
            {reqId:req.id,method:req.method,url:req.originalUrl},
            "START"
        );
        
        res.on("finish",() =>{
            const ms = Date.now() - start;

            logger.info(
                {reqId:req.id,method:req.method,url:req.originalUrl},
                "END"
            );

            if(res.statusCode >= 400) {
                logger.warn(
                    { reqId: req.id, method: req.method,
                      url: req.originalUrl, status: res.statusCode },
                    "HTTP ERROR"
                );
            }
        });
        next()
    }
}