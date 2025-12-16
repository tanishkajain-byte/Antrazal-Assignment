import pool from "../Connection/db.js";

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
