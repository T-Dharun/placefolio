const mysql = require("mysql2/promise");
const { Pool } = require("pg");

// MySQL Connection (Local)
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Dh@run_2**5",
    database: "placement"
});

// PostgreSQL Connection (Supabase)
const supabaseDb = new Pool({
    connectionString: 'postgresql://postgres:dharuneee007@db.chxqvthayqrtdujjhiib.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }, // Required for Supabase
});

// Test MySQL Connection
const testMysqlConnection = async () => {
    try {
        const connection = await db.getConnection();
        console.log("✅ Successfully connected to the MySQL database");
        connection.release();
    } catch (err) {
        console.error("❌ MySQL Database connection failed:", err.message);
    }
};

// Test PostgreSQL Connection
const testPgConnection = async () => {
    try {
        const client = await supabaseDb.connect();
        console.log("✅ Successfully connected to the Supabase PostgreSQL database");
        client.release();
    } catch (err) {
        console.error("❌ PostgreSQL Database connection failed:", err.message);
    }
};

// Test both connections
testMysqlConnection();
testPgConnection();

// Export both connections
module.exports = { db, supabaseDb };
