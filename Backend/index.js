/*
*********************************************************************************************************
 *  @File Name       : server.js
 *  @Author          : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company         : Antrazal
 *  @Date            : 15-12-2025
 *  @Description     : Entry point of the HealthSure backend server.
 *                     Initializes Express application, middleware,
 *                     API routes, and starts the server.
 *******************************************************************************************************
*/

import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import policyRoutes from "./routes/policyRoute.js"
import patientRoutes from "./routes/patientRoutes.js"
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/patients",patientRoutes);
app.use("/policies",policyRoutes);

app.get("/",(req,res)=>{
   return res.json({
   success: true,
   message: "WELCOME TO THE SERVER"
   });
});

app.listen(PORT,()=>{
   console.log(`Server is Running on ${PORT}`);
});