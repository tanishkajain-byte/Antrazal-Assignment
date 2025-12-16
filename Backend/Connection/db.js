/*
*********************************************************************************************************
 *  @File Name       : db.js
 *  @Author          : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company         : Antrazal
 *  @Date            : 12-12-2025
 *  @Description     : Creates and exports a MySQL connection pool using
 *                     mysql2 and environment variables for secure and
 *                     efficient database access across the application.
 *******************************************************************************************************
 *  JIRA ID     Developer                                  TITLE
 *  EZ-5        <Tanishka Jain>              Progressive add products LWC component development
*********************************************************************************************************
*/




import mysql2 from "mysql2"
import dotenv from "dotenv"
dotenv.config();

const pool = mysql2.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    waitForConnections:true,
    connectionLimit: 10,
    queueLimit: 0,
})


export default pool.promise();