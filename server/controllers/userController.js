const { db, supabaseDb }= require("../database/db");

// Function to validate and handle GPA or CGPA fields
const handleGPA = (gpa) => {
    // Convert "-" to null
    if (gpa === '-' || gpa === null) return null;

    // Ensure the value is a valid number
    const parsedGPA = parseFloat(gpa);
    if (isNaN(parsedGPA) || parsedGPA < 0 || parsedGPA > 100) {
        return null;  // or return a default value if needed, e.g., 0
    }
    return parsedGPA;
};
const handleArrear = (arrear) => {
    // Check if arrear is a string and apply trim() only if it's a string
    if (typeof arrear === 'string') {
        arrear = arrear.trim();
    }

    // If arrear is "-" or not a number or is an empty string, return 0
    return (arrear === '-' || isNaN(arrear) || arrear === '') ? 0 : arrear;
};


// Insert student into database
const insertStudents = async (req, res) => {
    try {
        const { excelData,year } = req.body;
        console.log(year);
        if (!excelData || !Array.isArray(excelData) || excelData.length === 0) {
            return res.status(400).json({
                error: "Invalid or empty data",
            });
        }

        // List of errors
        const errors = [];

        // Loop through each student's data
        for (const data of excelData) {
            const {
                full_name, first_name, last_name, last_expansion, roll_no, gender, dob_ddmmyyyy, dob_mmddyyyy,
                mobile_no, primary_email, college_email, mark_10th, mark_12th,
                diploma_mark, gpa_1sem, gpa_2sem, gpa_3sem, gpa_4sem, gpa_5sem, gpa_6sem, gpa_7sem, gpa_8sem, 
                cgpa_1sem, cgpa_2sem, cgpa_3sem, cgpa_4sem, cgpa_5sem, cgpa_6sem, cgpa_7sem, cgpa_8sem, number_of_arrears,
                history_of_arrears, pan_number
            } = data;
            // Validate required fields
            const requiredFields = {
                full_name, first_name, roll_no, gender, dob_ddmmyyyy,
                mobile_no, primary_email, college_email
            };

            const missingFields = Object.keys(requiredFields)?.filter(field => !requiredFields[field]);

            if (missingFields.length > 0) {
                errors.push({
                    roll_no,
                    error: `Missing required fields: ${missingFields.join(', ')}`
                });
                continue;  // Skip current iteration and proceed to the next one
            }

            // Prepare SQL query with ON DUPLICATE KEY UPDATE for roll_no
            const sql = `INSERT INTO students (
                full_name, first_name, last_name, last_expansion, roll_no, gender, dob_ddmmyyyy, dob_mmddyyyy,
                mobile_no, primary_email, college_email, mark_10th, mark_12th,
                diploma_mark, gpa_1sem, gpa_2sem, gpa_3sem, gpa_4sem, gpa_5sem, gpa_6sem, gpa_7sem, gpa_8sem, 
                cgpa_1sem, cgpa_2sem, cgpa_3sem, cgpa_4sem, cgpa_5sem, cgpa_6sem, cgpa_7sem, cgpa_8sem, number_of_arrears,
                history_of_arrears, pan_number, year
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                full_name = VALUES(full_name), first_name = VALUES(first_name), last_name = VALUES(last_name), 
                last_expansion = VALUES(last_expansion), gender = VALUES(gender), dob_ddmmyyyy = VALUES(dob_ddmmyyyy),
                dob_mmddyyyy = VALUES(dob_mmddyyyy), mobile_no = VALUES(mobile_no), primary_email = VALUES(primary_email), 
                college_email = VALUES(college_email), mark_10th = VALUES(mark_10th), mark_12th = VALUES(mark_12th),
                diploma_mark = VALUES(diploma_mark), gpa_1sem = VALUES(gpa_1sem), gpa_2sem = VALUES(gpa_2sem), 
                gpa_3sem = VALUES(gpa_3sem), gpa_4sem = VALUES(gpa_4sem), gpa_5sem = VALUES(gpa_5sem), gpa_6sem = VALUES(gpa_6sem),
                gpa_7sem = VALUES(gpa_7sem), gpa_8sem = VALUES(gpa_8sem), cgpa_1sem = VALUES(cgpa_1sem), 
                cgpa_2sem = VALUES(cgpa_2sem), cgpa_3sem = VALUES(cgpa_3sem), cgpa_4sem = VALUES(cgpa_4sem),
                cgpa_5sem = VALUES(cgpa_5sem), cgpa_6sem = VALUES(cgpa_6sem), cgpa_7sem = VALUES(cgpa_7sem),
                cgpa_8sem = VALUES(cgpa_8sem), number_of_arrears = VALUES(number_of_arrears),
                history_of_arrears = VALUES(history_of_arrears), pan_number = VALUES(pan_number)`;

            // Prepare values, convert "-" to null for GPA and CGPA fields
            const values = [
                full_name, first_name, last_name, last_expansion, roll_no, gender, dob_ddmmyyyy, dob_mmddyyyy,
                mobile_no, primary_email, college_email, handleGPA(mark_10th), handleGPA(mark_12th) || null, handleGPA(diploma_mark) || null,
                handleGPA(gpa_1sem), handleGPA(gpa_2sem), handleGPA(gpa_3sem), handleGPA(gpa_4sem), handleGPA(gpa_5sem),
                handleGPA(gpa_6sem), handleGPA(gpa_7sem), handleGPA(gpa_8sem), handleGPA(cgpa_1sem), handleGPA(cgpa_2sem),
                handleGPA(cgpa_3sem), handleGPA(cgpa_4sem), handleGPA(cgpa_5sem), handleGPA(cgpa_6sem), handleGPA(cgpa_7sem),
                handleGPA(cgpa_8sem), handleArrear(number_of_arrears) || null, handleArrear(history_of_arrears) || null, pan_number, year || 0
            ];

            // Perform the database operation
            

            const sqlPostgres = `INSERT INTO students (
                full_name, first_name, last_name, last_expansion, roll_no, gender, dob_ddmmyyyy, dob_mmddyyyy,
                mobile_no, primary_email, college_email, mark_10th, mark_12th, diploma_mark, gpa_1sem, gpa_2sem,
                gpa_3sem, gpa_4sem, gpa_5sem, gpa_6sem, gpa_7sem, gpa_8sem, cgpa_1sem, cgpa_2sem, cgpa_3sem,
                cgpa_4sem, cgpa_5sem, cgpa_6sem, cgpa_7sem, cgpa_8sem, number_of_arrears, history_of_arrears,
                pan_number, year
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
            ON CONFLICT (roll_no) DO UPDATE SET
                full_name = EXCLUDED.full_name, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name,
                last_expansion = EXCLUDED.last_expansion, gender = EXCLUDED.gender, dob_ddmmyyyy = EXCLUDED.dob_ddmmyyyy,
                dob_mmddyyyy = EXCLUDED.dob_mmddyyyy, mobile_no = EXCLUDED.mobile_no, primary_email = EXCLUDED.primary_email,
                college_email = EXCLUDED.college_email, mark_10th = EXCLUDED.mark_10th, mark_12th = EXCLUDED.mark_12th,
                diploma_mark = EXCLUDED.diploma_mark, gpa_1sem = EXCLUDED.gpa_1sem, gpa_2sem = EXCLUDED.gpa_2sem,
                gpa_3sem = EXCLUDED.gpa_3sem, gpa_4sem = EXCLUDED.gpa_4sem, gpa_5sem = EXCLUDED.gpa_5sem, gpa_6sem = EXCLUDED.gpa_6sem,
                gpa_7sem = EXCLUDED.gpa_7sem, gpa_8sem = EXCLUDED.gpa_8sem, cgpa_1sem = EXCLUDED.cgpa_1sem, cgpa_2sem = EXCLUDED.cgpa_2sem,
                cgpa_3sem = EXCLUDED.cgpa_3sem, cgpa_4sem = EXCLUDED.cgpa_4sem, cgpa_5sem = EXCLUDED.cgpa_5sem, cgpa_6sem = EXCLUDED.cgpa_6sem,
                cgpa_7sem = EXCLUDED.cgpa_7sem, cgpa_8sem = EXCLUDED.cgpa_8sem, number_of_arrears = EXCLUDED.number_of_arrears,
                history_of_arrears = EXCLUDED.history_of_arrears, pan_number = EXCLUDED.pan_number, year = EXCLUDED.year`;
            
                try{
                    await db.query(sql, values);
                }
                catch(err){
                    console.log("Local DB Not established")
                }
                try{
                    await supabaseDb.query(sqlPostgres, values);
                }
                catch(err){
                    console.log("SupaBase DB not connected");
                }
                
            


        }

        // Return a response with success or failure details
        if (errors.length > 0) {
            console.log(errors);
            return res.status(400).json({
                message: "Some records could not be inserted due to missing fields",
                errors
            });
        }

        return res.status(200).json({
            message: "Students inserted/updated successfully",
        });

    } catch (err) {
        console.error("Error during student insertion:", err);
        return res.status(500).json({
            error: "Internal server error",
            details: err.message,
        });
    }
};

const selectStudents = async (req, res) => {
    const sql = `SELECT * FROM students`;
    
    try {
        // Check if local DB is available
        const [rows, fields] = await db.execute(sql);
        if (rows.length > 0) {
            return res.status(200).json({ message: "Students fetched successfully", students: rows });
        }
    } catch (err) {
        console.warn("Local DB not available or error occurred:", err);
    }
    
    try {
        // If local DB fails, check Supabase
        const { rows } = await supabaseDb.query(sql);
        return res.status(200).json({ message: "Students fetched successfully from Supabase", students: rows });
    } catch (err) {
        console.error("Error fetching students from Supabase:", err);
        return res.status(500).json({ error: "Database error" });
    }
};


// DELETE route to delete students by year
const deleteStudentsByYear = async (req, res) => {
    const { year } = req.params;

    if (!year) {
        return res.status(400).json({ error: "Year is required" });
    }

    const sql = `DELETE FROM students WHERE year = ?`;
        
    try {
        // Attempt to delete from Supabase PostgreSQL database if local DB fails
        if (supabaseDb) {
            const { rowCount } = await supabaseDb.query(`DELETE FROM students WHERE year = $1`, [year]);

            if (rowCount > 0) {
                return res.status(200).json({ message: `${rowCount} student(s) deleted successfully from Supabase for year ${year}` });
            }
        }
    } catch (err) {
        console.error("Supabase DB error:");
    }

    try {
        // Attempt to delete from the local MySQL database
        if (db) {
            const [result] = await db.execute(sql, [year]);

            if (result.affectedRows > 0) {
               return  res.status(200).json({ message: `${result.affectedRows} student(s) deleted successfully from local database for year ${year}` });
            }
        }
    } catch (err) {
        console.error("Local DB error:");
    }


    return res.status(404).json({ message: `No students found for the year ${year} in either database` });
};


module.exports = { selectStudents, insertStudents, deleteStudentsByYear };