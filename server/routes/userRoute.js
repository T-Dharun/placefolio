const express = require("express");
const { insertStudents,selectStudents, deleteStudentsByYear } = require("../controllers/userController");

const router = express.Router();

router.post("/create-students", insertStudents);
router.delete("/delete-students/:year", deleteStudentsByYear);
router.get("/students", selectStudents);

module.exports = router;
