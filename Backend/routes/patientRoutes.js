/*
*********************************************************************************************************
 *  @File Name       : patientRoutes.js
 *  @Author          : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company         : Antrazal
 *  @Date            : 12-12-2025
 *  @Description     : Defines REST API routes for patient
 *                     operations and maps them to controllers.
 *******************************************************************************************************
*/


import express from "express"
import { createPatient, getPatients, getPatientById, deletePatient } from "../controllers/patients.controller.js";

const router = express.Router();

router.get("/",getPatients);
router.post("/create",createPatient);
router.delete("/delete/:id",deletePatient);
router.get("/:id",getPatientById); 


export default router;