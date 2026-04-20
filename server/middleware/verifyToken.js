"use strict"
const jwt = require('jsonwebtoken');


module.exports = function requireSessionAuth(){
    return (req,res,next) =>{
        const token = req.cookies.token_accesso;
        if(!token){
            return res.status(401).json({
                error: "Unauthorized",
                message: "Token scaduto",
                requestId: req.id
            })
        }

        try{
            const secretKey = process.env.JWT_SECRET || 'segreto_di_sviluppo';
            const datiDecodificati = jwt.verify(token,secretKey);

            req.user = datiDecodificati
            next();
        }
        catch(err){
            return res.json(400).json({message:err});
        }
    }
}