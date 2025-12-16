
/*
*********************************************************************************************************
 *  @File Name       : policies.controller.js
 *  @Author          : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company         : Antrazal
 *  @Date            : 15-12-2025
 *  @Description     : Manages policy-related operations including
 *                     creation, renewal, cancellation, status tracking,
 *                     and fetching policies by patient.
 *******************************************************************************************************
*/


import pool from "../Connection/db.js";

/*
*********************************************************
 *  @Method Name    : createPolicy
 *  @Author         : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company        : Antrazal
 *  @Description   : Creates a new insurance policy for
 *                   a specific patient.
 *  @Param         : req, res
 *  @Return        : JSON policy ID
*********************************************************
*/


export const createPolicy = async (req,res) =>{
    try {
      const {patient_id, policy_number, plan_name, sum_insured, start_date, end_date, status} = req.body; 
    if (
      !patient_id ||
      !policy_number ||
      !plan_name ||
      !sum_insured ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required except status",
      });
    }
      const sql = 'INSERT INTO policy(patient_id, policy_number, plan_name, sum_insured, start_date, end_date, status) values (?,?,?,?,?,?,?)';
      const [result] = await pool.query(sql, [
      patient_id,
      policy_number,
      plan_name,
      sum_insured,
      start_date,
      end_date,
      status || 'active',
    ]);
      return res.status(200).json({
        success:true,
        message:"",
        policyId: result.insertId
      })
    } catch (error) {
        console.log(error);
    }
}
/*
*********************************************************
 *  @Method Name    : getPoliciesByPatient
 *  @Author         : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company        : Antrazal
 *  @Description   : Retrieves all policies associated
 *                   with a given patient ID.
 *  @Param         : req, res
 *  @Return        : JSON list of policies
*********************************************************
*/


export const getPoliciesByPatient = async (req,res) =>{
    try {
        const id = req.params.id;
        const [policies] = await pool.query('select * from policy where patient_id = ?',[id]);
        return res.status(200).json({success:true, message:"data retrieve successfully", data:policies});
    } catch (error) {
        console.log(error);
    }
}
/*
*********************************************************
 *  @Method Name    : statusOfPolicies
 *  @Author         : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company        : Antrazal
 *  @Description   : Returns aggregated counts of active,
 *                   cancelled, expired, and expiring policies.
 *  @Param         : req, res
 *  @Return        : JSON policy statistics
*********************************************************
*/

export const statusOfPolicies = async(req,res) =>{
    try {
        const sql = `SELECT
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeCount,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledCount,
       SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) AS expiredCount,
       SUM(CASE WHEN end_date between CURDATE() AND DATE_ADD(CURDATE(),INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS expiringCount
       FROM policy;`
        const [result] = await pool.query(sql);
        return res.status(200).json({success:true, message:"get status of policies", result:result[0]});
    } catch (error) {
        return res.json({
            success:false,
            error:error,
        })
    }
}
/*
*********************************************************
 *  @Method Name    : cancelPolicy
 *  @Author         : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company        : Antrazal
 *  @Description   : Cancels a policy using policy number
 *                   and updates end date to current date.
 *  @Param         : req, res
 *  @Return        : JSON update status
*********************************************************
*/

export const cancelPolicy = async (req,res) =>{
    try {
        const id = req.params.id;
        const sql = `update policy set status = "cancelled", end_date = CURDATE() where policy_number = ?`;
        const [result] = await pool.query(sql,[id]);
        if(result.affectedRows === 0){
               return res.status(404).json({
                success: false,
                message: "Policy not found"
            });
        }
        return res.json({
            success: true,
            message:"policy get cancelled",
            updatedPolicy: result.affectedRows,
        })
    } catch (error) {
       console.log(error); 
       return res.status(500).json({
            success:false,
            error:error,
            message:"Internal Server Error"
        }) 
    }
}
/*
*********************************************************
 *  @Method Name    : renewPolicy
 *  @Author         : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company        : Antrazal
 *  @Description   : Renews an existing policy by extending
 *                   its end date by one year.
 *  @Param         : req, res
 *  @Return        : JSON update status
*********************************************************
*/

export const renewPolicy = async (req, res) => {
    try {
        const id = req.params.id;
        const sql = `
            UPDATE policy 
            SET status = "active", 
                end_date = DATE_ADD(end_date, INTERVAL 1 YEAR)
            WHERE policy_number = ?
        `;
        const [result] = await pool.query(sql, [id]);
        if(result.affectedRows === 0){
               return res.status(404).json({
                success: false,
                message: "Policy not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Policy renewed successfully",
            updatedPolicy: result.affectedRows,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            error:error,
            message:"Internal Server Error"
        }) 
    }
};
