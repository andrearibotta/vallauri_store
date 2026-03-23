let pool;
const  mysql = require("mysql/promise");

function createPoolFromMysql(){
    if(pool) return pool;
    pool = mysql.createPool({
        host: process.env.MYSQL_HOST || "172.0.0.1",
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "express_middleware_lab",
        waitForConnections: true,
        connectionLimit: 10,
        charset: "utf8mb4"
    });

    return pool;
}

async function testConnection(){
    const p = createPoolFromMysql();
    const conn = await p.getConnection();
    try{
        await conn.ping();
        return true;
    }
    finally{
        conn.release()
    }
}

async function query(sql, params = []){
    const p = createPoolFromMysql();
    const [rows] = await p.execute(sql,params);
    return rows || null 
}

module.exports = {
    createPoolFromMysql,
    testConnection,
    query
}