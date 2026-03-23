"use strict"

module.exports = function requireSessionAuth(){
    return (req,res,next) =>{
        if(!req.session || !req.session.user){
            return res.status(401).json({
                error: "Unauthorized",
                message: "Sessione non valida o scaduta",
                requestId: req.id
            })
        }

        req.user = req.session.user;
        next();
    }
}