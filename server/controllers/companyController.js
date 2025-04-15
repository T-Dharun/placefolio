
const { db } = require("../database/db");

// Update or Insert Company and Student Data (MySQL Version)
const createStudentCompany = async (req, res) => {
    try {
        const { companyName, companyType, status, excelData, date } = req.body;
        console.log(excelData)
        // Insert or Update Company
        const companyQuery = `
            INSERT INTO Company (company_name, type)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE type = VALUES(type);
        `;
        await db.query(companyQuery, [companyName, companyType]);

        // Get Company ID
        const companyIdQuery = `SELECT company_id FROM Company WHERE company_name = ?`;
        const [companyRows] = await db.query(companyIdQuery, [companyName]);
        const companyId = companyRows[0]?.company_id;

        if (excelData && excelData.length > 0) {
            for (const row of excelData) {
                const studentId = row['Reg No'] || row['Roll No'] || row?.RegNo;
                const studentName = row['Name'] || row['NAME'];
                
                // Check if student exists
                const checkStudentQuery = `SELECT roll_no FROM students WHERE roll_no = ?`;
                const [studentResult] = await db.query(checkStudentQuery, [studentId]);

                // Insert Student if not exists
                console.log(studentResult);
                if (studentResult.length === 0) {
                    continue;
                }

                // Insert or Update Student_Company Relationship
                const studentCompanyQuery = `
                    INSERT INTO Student_Company (studentid, company_id, status, date)
                    VALUES (?, ?, ?, ?);
                `;

                await db.query(studentCompanyQuery, [studentId, companyId, status, date]);
            }
        }

        res.json({ message: 'Data received and stored successfully' });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: 'Error processing request: ' + error.message });
    }
};


const getCompany = async (req, res) => {
    try {
        // Using await to handle the promise result
        const [companyResult] = await db.query('SELECT company_name FROM Company');

        res.json({ message: 'Data fetched successfully', data: companyResult });
    } catch (error) {
        console.error('Unexpected Error:', error);
        res.status(500).json({ message: 'Unexpected Error: ' + error.message });
    }
};



// Get Student Details by Registration Number
const getStudents = async (req, res) => {
    try {
        const studentQuery = `
            SELECT *
            FROM students AS s
            INNER JOIN Student_Company AS sc ON s.roll_no = sc.studentid
            INNER JOIN Company AS c ON sc.company_id = c.company_id
        `;

        // Using await to handle the query result as a promise
        const [results] = await db.query(studentQuery);
        
        // Returning the results
        res.json({ message: "Data fetched successfully", data: results });
    } catch (error) {
        console.error("Unexpected Error:", error);
        res.status(500).json({ message: "Unexpected Error: " + error.message });
    }
};


module.exports = {getStudents,getCompany,createStudentCompany};
