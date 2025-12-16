import express from "express"
import {  cancelPolicy, createPolicy, getPoliciesByPatient, renewPolicy, statusOfPolicies } from "../controllers/policies.controller.js";

const router = express.Router();

router.post("/createPolicy",createPolicy);
router.get("/statusofpolicies",statusOfPolicies);
router.get("/:id",getPoliciesByPatient);
router.put("/:id/cancel",cancelPolicy);
router.put("/:id/renew",renewPolicy);

export default router;