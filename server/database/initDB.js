const { db } = require("./db");

const createTables = async () => {
    try {
        const createStudentsTable = `
        CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name CHAR(50),
            last_expansion VARCHAR(255),
            roll_no VARCHAR(50) UNIQUE NOT NULL,
            gender VARCHAR(10) NOT NULL,
            dob_ddmmyyyy VARCHAR(15),
            dob_mmddyyyy VARCHAR(15),
            mobile_no VARCHAR(15) NOT NULL,
            primary_email VARCHAR(255) NOT NULL,
            college_email VARCHAR(255) NOT NULL,
            mark_10th FLOAT,
            mark_12th FLOAT,
            diploma_mark FLOAT,
            gpa_1sem FLOAT,
            gpa_2sem FLOAT,
            gpa_3sem FLOAT,
            gpa_4sem FLOAT,
            gpa_5sem FLOAT,
            gpa_6sem FLOAT,
            gpa_7sem FLOAT,
            gpa_8sem FLOAT,
            cgpa_1sem FLOAT,
            cgpa_2sem FLOAT,
            cgpa_3sem FLOAT,
            cgpa_4sem FLOAT,
            cgpa_5sem FLOAT,
            cgpa_6sem FLOAT,
            cgpa_7sem FLOAT,
            cgpa_8sem FLOAT,
            number_of_arrears INT,
            history_of_arrears INT,
            year INT,
            pan_number VARCHAR(20) UNIQUE
        );`;

        const createCompanyTable = `
        CREATE TABLE IF NOT EXISTS Company (
            company_id INT AUTO_INCREMENT PRIMARY KEY,
            company_name VARCHAR(255) UNIQUE NOT NULL,
            package VARCHAR(100),
            type VARCHAR(100) NOT NULL
        );`;

        const createStudentCompanyTable = `
        CREATE TABLE IF NOT EXISTS Student_Company (
            studentid VARCHAR(50),
            company_id INT,
            status VARCHAR(100),
            date VARCHAR(15),
            PRIMARY KEY (studentid, company_id),
            FOREIGN KEY (studentid) REFERENCES students(roll_no) ON DELETE CASCADE,
            FOREIGN KEY (company_id) REFERENCES Company(company_id) ON DELETE CASCADE
        );`;

        // Execute queries in proper order
        await db.query(createStudentsTable);
        console.log("Students table created successfully!");

        await db.query(createCompanyTable);
        console.log("Company table created successfully!");

        await db.query(createStudentCompanyTable);
        console.log("Student_Company table created successfully!");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        db.end(); // Close connection after all queries
    }
};

// Call the function to create tables
createTables();
