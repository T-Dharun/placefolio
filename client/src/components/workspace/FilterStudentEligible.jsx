import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import StudentTable from "./StudentTable";
import { db } from "../database/firebase"
import { collection, getDocs } from "firebase/firestore";
import { Container, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import "./style.css";


const inputFields = [
  { name: "cpga", placeholder: "Enter CGPA" },
  { name: "semester", placeholder: "Enter Semester (e.g., 1, 2, 3, 4)" },
  { name: "mark_10th", placeholder: "Enter 10th Mark" },
  { name: "mark_12th", placeholder: "Enter 12th Mark" },
  { name: "arrears", placeholder: "Enter Number of Arrears" },
  { name: "history_of_arrears", placeholder: "Enter History of Arrears" },
  { name: "year", placeholder: "Enter Year 2026" },
];

const dateFormats = {
  "dd/mm/yyyy": (date) => date ? new Date(date).toLocaleDateString("en-GB") : "",
  "mm/dd/yyyy": (date) => date ? new Date(date).toLocaleDateString("en-US") : "",
  "dd-mm-yyyy": (date) => date ? date.split("-").reverse().join("-") : "",
  "dd.mm.yyyy": (date) => date ? date.split("-").reverse().join(".") : "",
  "dd-month-yyyy": (date) => {
    if (!date) return "";

    let [year, month, day] = date.split("-");
    if (!day || !month || !year) return "";
    day = parseInt(day);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(month, 10) - 1;
    console.log(day, month, year, date);
    return `${parseInt(day, 10)}-${monthNames[monthIndex]}-${year}`;
  }
};



const FilterStudentEligible = () => {
  let [originalFileData, setOriginalFileData] = useState([]);
  let [filteredFileData, setFilteredFileData] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("dd/mm/yyyy");
  let [selectedColumns, setSelectedColumns] = useState([]);
  const[isLoading,setIsLoading]=useState(false)
  const [columns,setColumns]=useState([
    "s.no",
    "full_name",
    "roll_no",
    "gender",
    "dob_ddmmyyyy",
    "mobile_no",
    "primary_email",
    "college_email",
    "year",
    "gpa_1sem",
    "gpa_2sem",
    "gpa_3sem",
    "gpa_4sem",
    "gpa_5sem",
    "gpa_6sem",
    "gpa_7sem",
    "gpa_8sem",
    "cgpa_1sem",
    "cgpa_2sem",
    "cgpa_3sem",
    "cgpa_4sem",
    "cgpa_5sem",
    "cgpa_6sem",
    "cgpa_7sem",
    "cgpa_8sem",
    "history_of_arrears",
    "number_of_arrears"
  ]);
  let [filter, setFilter] = useState({
    cpga: null,
    mark_10th: null,
    mark_12th: null,
    arrears: null,
    history_of_arrears: null,
    semester: null,
    year: null,
  });
  console.log(columns)
  const fetchStudents = async () => {
    setIsLoading(true);
    const studentsCollection = collection(db, "students");
    const studentsSnapshot = await getDocs(studentsCollection);
    const originalFileData = studentsSnapshot.docs.map(doc => doc.data());
    setOriginalFileData(originalFileData);
    sortandStore(originalFileData);
    const allKeys = new Set(columns);

    for (let i = 0; i < originalFileData.length; i++) {
      const keys = Object.keys(originalFileData[i]);
      keys.forEach(key => {
        if (key !== undefined) {
          allKeys.add(key);
        }
      });
    }
    
    setColumns(Array.from(allKeys));
    
    console.log(columns)
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);


  const sortandStore = (filteredData) => {
    const sortedData = [...filteredData].sort((a, b) => {
      const getPrefix = (rollObj) => {
        const roll = rollObj.roll_no;
        if (!roll) return ''; 
        return roll.slice(4, 5);
      };

      const getNumber = (rollObj) => {
        const roll = rollObj.roll_no;
        if (!roll) return Infinity;
        return parseInt(roll.slice(5));
      };

      const prefixA = getPrefix(a);
      const prefixB = getPrefix(b);

      if (prefixA === prefixB) {
        return getNumber(a) - getNumber(b);
      }

      return prefixA === 'R' ? -1 : 1;
    });

    setFilteredFileData(sortedData);
  }


  const toggleColumnSelection = (column) => {
    setSelectedColumns(prev =>
      prev.includes(column) ? prev.filter(col => col !== column) : [...prev, column]
    );
  };

  const handleFilter = () => {
    const filteredData = originalFileData.filter(student => {

      const studentCgpa = student[`cgpa_${filter.semester}sem`] || 0;

      const isCgpaValid = filter.cpga ? studentCgpa >= filter.cpga : false;

      const isMark10thValid = filter.mark_10th ? student.mark_10th >= filter.mark_10th : true;

      const isMark12thValid = student.mark_12th ? student.mark_12th >= filter.mark_12th : student.diploma_mark >= filter.mark_12th;

      const isArrearsValid = student.number_of_arrears ? student.number_of_arrears <= filter.arrears : true;

      const isHistoryOfArrearsValid = student.history_of_arrears ? student.history_of_arrears <= filter.history_of_arrears : true;

      const isYearValid = student.year == filter.year;

      return isCgpaValid && isMark10thValid && isMark12thValid && isArrearsValid && isHistoryOfArrearsValid && isYearValid && !student?.placed;
    });
    sortandStore(filteredData);
  };

  const downloadExcel = () => {
    if (selectedColumns.length === 0) {
      alert("Please select at least one column to download.");
      return;
    }

    const filteredData = filteredFileData.map((student, index) => {
      let selectedData = {};
      selectedColumns.forEach(col => {
        let value = student[col];

        if (col.includes("gpa") || col.includes("cgpa")) {
          value = parseFloat(value).toFixed(2);
        } else if (col === "s.no") {
          value = index + 1;
        } else if (col === "dob_ddmmyyyy") {
          value = dateFormats[selectedFormat](value);
        }

        selectedData[col] = value;
      });
      return selectedData;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    const columnWidths = selectedColumns.map(col => ({
      wch: Math.max(10, ...filteredData.map(row => row[col] ? row[col].toString().length : 0)) + 2
    }));

    worksheet['!cols'] = columnWidths; 

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(data, "Filtered_Students.xlsx");
  };


  return (
    <Container className="filter-students-container">
      <main className="filter-students-main">

        <div className="action-buttons">
          <Button className="download-btn" onClick={fetchStudents}>
            Refresh Student Record
          </Button>
          <Button className="download-btn" onClick={downloadExcel}>
            Download Excel
          </Button>
        </div>

        <section className="filter-section">
          <Form>
            <Row className="filter-inputs">
              {inputFields.map(({ name, placeholder }) => (
                <Col key={name} md={3} sm={6} xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="number"
                      name={name}
                      id={name}
                      placeholder={placeholder}
                      value={filter[name] || ""}
                      onChange={(e) =>
                        setFilter({ ...filter, [name]: e.target.value })
                      }
                      className="filter-input"
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>
            <div className="filter-btn-wrapper">
              <Button className="filter-btn" onClick={handleFilter}>
                Apply Filter
              </Button>
            </div>
          </Form>
        </section>

        {
          !isLoading && (filteredFileData?.length != 0 ? (
            <div className="table-wrapper p-0">
              <StudentTable
                filteredFileData={filteredFileData}
                filter={filter}
                columns={columns}
                dateFormats={dateFormats}
                toggleColumnSelection={toggleColumnSelection}
                selectedColumns={selectedColumns}
                selectedFormat={selectedFormat}
                setSelectedFormat={setSelectedFormat}
              />
            </div>
          ) : (
            <div className="text-center py-5"> No Items found</div>
          ))
        }
        {
          isLoading && <div className="bg-light text-center py-3">
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          Fetching students data
        </div>
        }
      </main>
    </Container>
  );
};

export default FilterStudentEligible;










































































































// const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     const response = await fetch('http://localhost:5000/api/students', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//     const result = await response.json();
//     setOriginalFileData(result?.students);
//     sortandStore(result?.students);
//   } catch (err) {
//     try {
//       const response = await fetch('https://placefolio.onrender.com/api/students', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       const result = await response.json();
//       setOriginalFileData(result?.students);
//       sortandStore(result?.students);
//     } catch (er) {
//       console.error('Error fetching students cloud data:', er);
//     }
//     console.error('Error fetching students local data:', err);
//   }
// };