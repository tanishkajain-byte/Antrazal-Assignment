import express from "express"
import { createPatient, getPatients, getPatientById, deletePatient } from "../controllers/patients.controller.js";

const router = express.Router();

router.get("/",getPatients);
router.post("/create",createPatient);
router.delete("/delete/:id",deletePatient);
router.get("/:id",getPatientById); 


export default router;