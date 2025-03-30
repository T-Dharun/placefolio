const { supabaseDb } = require("./db");

const createTable = async () => {
    try {
        const createTableQuery = `
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(50),
    last_expansion VARCHAR(255),
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    dob_ddmmyyyy VARCHAR(15),
    dob_mmddyyyy VARCHAR(15),
    mobile_no VARCHAR(15) NOT NULL,
    primary_email VARCHAR(255) NOT NULL,
    college_email VARCHAR(255) NOT NULL,
    mark_10th REAL,
    mark_12th REAL,
    diploma_mark REAL,
    gpa_1sem REAL,
    gpa_2sem REAL,
    gpa_3sem REAL,
    gpa_4sem REAL,
    gpa_5sem REAL,
    gpa_6sem REAL,
    gpa_7sem REAL,
    gpa_8sem REAL,
    cgpa_1sem REAL,
    cgpa_2sem REAL,
    cgpa_3sem REAL,
    cgpa_4sem REAL,
    cgpa_5sem REAL,
    cgpa_6sem REAL,
    cgpa_7sem REAL,
    cgpa_8sem REAL,
    number_of_arrears INT,
    history_of_arrears INT,
    year INT,
    pan_number VARCHAR(20) UNIQUE
);
`;
        await supabaseDb.query(createTableQuery);
        console.log("✅ Students table created successfully in PostgreSQL!");
    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        supabaseDb.end();  // Close the connection
    }
};

// Run the function
createTable();
