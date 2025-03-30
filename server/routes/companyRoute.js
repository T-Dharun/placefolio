const express = require("express");
const { createStudentCompany, getCompany, getStudents } = require("../controllers/companyController");

const router = express.Router();

router.post("/create-student-company", createStudentCompany);
router.get("/company", getCompany);
router.get("/student-record", getStudents);

module.exports = router;
