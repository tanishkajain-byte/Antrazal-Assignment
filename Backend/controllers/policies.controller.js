import pool from "../Connection/db.js";

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

export const getPoliciesByPatient = async (req,res) =>{
    try {
        const id = req.params.id;
        const [policies] = await pool.query('select * from policy where patient_id = ?',[id]);
        return res.status(200).json({success:true, message:"data retrieve successfully", data:policies});
    } catch (error) {
        console.log(error);
    }
}

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
