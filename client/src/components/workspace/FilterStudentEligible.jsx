import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import StudentTable from "./StudentTable";
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import "./style.css";


const inputFields = [
  { name: "cpga", placeholder: "Enter CGPA" },
  { name: "mark_10th", placeholder: "Enter 10th Mark" },
  { name: "mark_12th", placeholder: "Enter 12th Mark" },
  { name: "arrears", placeholder: "Enter Number of Arrears" },
  { name: "history_of_arrears", placeholder: "Enter History of Arrears" },
  { name: "semester", placeholder: "Enter Semester (e.g., 1, 2, 3, 4)" },
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

    // Convert numeric month to short month name (e.g., 3 → Mar)
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
  let [filter, setFilter] = useState({
    cpga: null,
    mark_10th: null,
    mark_12th: null,
    arrears: null,
    history_of_arrears: null,
    semester: null,
  });
  const sortandStore= (filteredData) => {
    const sortedData = [...filteredData].sort((a, b) => {
      const getPrefix = (rollObj) => {
        const roll = rollObj.roll_no;
        if (!roll) return ''; // Fallback for missing roll_no
        return roll.slice(4, 5); // 'R' or 'L'
      };
    
      const getNumber = (rollObj) => {
        const roll = rollObj.roll_no;
        if (!roll) return Infinity; // Send to end if no roll number
        return parseInt(roll.slice(5)); // Gets 001, 111, etc.
      };
    
      const prefixA = getPrefix(a);
      const prefixB = getPrefix(b);
    
      if (prefixA === prefixB) {
        return getNumber(a) - getNumber(b);
      }
    
      return prefixA === 'R' ? -1 : 1;
    });
    
    console.log(sortedData);
    setFilteredFileData(sortedData);
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      setOriginalFileData(result?.students);
      sortandStore(result?.students);
    } catch (err) {
      try {
        const response = await fetch('https://placefolio.onrender.com/api/students', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        setOriginalFileData(result?.students);
        sortandStore(result?.students);
      } catch (er) {
        console.error('Error fetching students cloud data:', er);
      }
      console.error('Error fetching students local data:', err);
    }
  };

  const toggleColumnSelection = (column) => {
    setSelectedColumns(prev =>
      prev.includes(column) ? prev.filter(col => col !== column) : [...prev, column]
    );
  };

  console.log()
  const handleFilter = () => {
    const filteredData = originalFileData.filter(student => {

      const studentCgpa = student[`cgpa_${filter.semester}sem`] || 0;
      const isCgpaValid = filter.cpga ? studentCgpa >= filter.cpga : false;
      const isMark10thValid = filter.mark_10th ? student.mark_10th >= filter.mark_10th : true;
      const isMark12thValid = student.mark_12th ? student.mark_12th >= filter.mark_12th : student.diploma_mark >= filter.mark_12th;

      const isArrearsValid = student.number_of_arrears ? student.number_of_arrears <= filter.arrears : true;
      const isHistoryOfArrearsValid = student.history_of_arrears ? student.history_of_arrears <= filter.history_of_arrears : true;

      return isCgpaValid && isMark10thValid && isMark12thValid && isArrearsValid && isHistoryOfArrearsValid;
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

        // Format GPA and CGPA to 2 decimal places
        if (col.includes("gpa") || col.includes("cgpa")) {
          value = parseFloat(value).toFixed(2); // Ensure it has only 2 decimal places
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

    // Dynamically adjust column widths
    const columnWidths = selectedColumns.map(col => ({
      wch: Math.max(10, ...filteredData.map(row => row[col] ? row[col].toString().length : 0)) + 2
    }));

    worksheet['!cols'] = columnWidths; // Set the calculated column widths

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
          <Button className="download-btn" onClick={handleSubmit}>
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
                <Col key={name} md={4} sm={6} xs={12}>
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
          filteredFileData?.length != 0 ? (
            <div className="table-wrapper p-0">
              <StudentTable
                filteredFileData={filteredFileData}
                filter={filter}
                dateFormats={dateFormats}
                toggleColumnSelection={toggleColumnSelection}
                selectedColumns={selectedColumns}
                selectedFormat={selectedFormat}
                setSelectedFormat={setSelectedFormat}
              />
            </div>
          ) : (
            <div className="text-center "> Please Try again later ... No Items found</div>
          )
        }
      </main>
    </Container>
  );
};

export default FilterStudentEligible;
