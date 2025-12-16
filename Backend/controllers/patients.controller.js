/*
*********************************************************************************************************
 *  @File Name       : patients.controller.js
 *  @Author          : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company         : Antrazal
 *  @Date            : 12-12-2025
 *  @Description     : Handles all patient-related operations including
 *                     creating, deleting, retrieving patients and
 *                     fetching patient details by ID.
 *******************************************************************************************************
*/


import pool from "../Connection/db.js";
/*
*********************************************************
 *  @Method Name    : createPatient
 *  @Author         : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company        : Antrazal
 *  @Description   : Creates a new patient record in the
 *                   database after validating input fields.
 *  @Param         : req, res
 *  @Return        : JSON response with patient ID
*********************************************************
*/

export const createPatient = async (req, res) => {
  try {
    const { name, email, gender, city, age, phone } = req.body;

    if (!name || !email || !gender || !city || !age || !phone) {
      return res.json({
        success: false,
        message: "All fields are required"
      });
    }

    const sql = `
      INSERT INTO patients
      (name, email, phone, age, city, gender)
      VALUES (?,?,?,?,?,?)
    `;

    const [result] = await pool.query(sql, [
      name,
      email,
      phone,
      age,
      city,
      gender
    ]);

    return res.status(200).json({
      success: true,
      message: "Patient created successfully",
      patient: result.insertId
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
/*
*********************************************************
 *  @Method Name    : deletePatient
 *  @Author         : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company        : Antrazal
 *  @Description   : Deletes a patient record based on
 *                   provided patient ID.
 *  @Param         : req, res
 *  @Return        : JSON success response
*********************************************************
*/

export const deletePatient = async (req,res) =>{
  try {
    const id = req.params.id;
    const sql = `delete from patients where id = ?`;
    const result = await pool.query(sql,[id]);
    return res.status(200).json({
      success: true,
      message:"Patient deleted"
    });
  } catch (error) {
    console.log(error);
        return res.json({
            success:false,
            error:error,
        });
  }
}
/*
*********************************************************
 *  @Method Name    : getPatients
 *  @Author         : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company        : Antrazal
 *  @Description   : Retrieves all patients along with
 *                   count of active policies.
 *  @Param         : req, res
 *  @Return        : JSON list of patients
*********************************************************
*/

export const getPatients = async (req,res) =>{
    try {
        const sql = `select p.*,
                    (
                    select count(*) from policy 
                    where status = 'active' 
                    and p.id = policy.patient_id
                    )  as activePolicies
                    from patients p 
                    order by p.created_at DESC`;
        const [patients] = await pool.query(sql);
        return res.status(200).json({
            success:true,
            message:"Data retrieved successfully",
            data : patients,
        })
    } catch (error) {
        console.log(error);
        return res.json({
            success:false,
            error:error,
        })
    }
}

/*
*********************************************************
 *  @Method Name    : getPatientById
 *  @Author         : <Tanishka Jain>(tanishka.jain@antrazal.com)
 *  @Company        : Antrazal
 *  @Description   : Fetches patient details using patient ID.
 *  @Param         : req, res
 *  @Return        : JSON patient object
*********************************************************
*/

export const getPatientById = async (req,res) =>{
    try {
        const { id } = req.params;
        const [patient] = await pool.query('select * from patients where id = ?', [id]);
        return res.status(200).json({
            success:true,
            message:"Data retrieved successfully",
            data: patient[0] || null,
        })
    } catch (error) {
        console.log(error);
        return res.json({
            success:false,
            error:error,
        })
    }
}
