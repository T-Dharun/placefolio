import React, { useRef, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import "./style.css";

const StudentTable = ({
  filteredFileData,
  filter,
  dateFormats,
  toggleColumnSelection,
  selectedColumns,
  selectedFormat,
  setSelectedFormat
}) => {
  const columns = [
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
  ];

  console.log(filteredFileData)

  return (
    <div className="student-table-container p-0">
      <div className="date-format-selector">
        <Form.Label htmlFor="dateFormat" className="elegant-label">
          Select Date Format
        </Form.Label>
        <Form.Select
          id="dateFormat"
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="format-select"
        >
          {Object.keys(dateFormats).map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </Form.Select>
      </div>

      {/* Table with Bottom Scrollbar */}
      <div className="table-wrapper-1 p-0">
        <table className="student-table">
          <thead className='sticky-top'>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => toggleColumnSelection(col)}
                  className={`table-header  ${
                    selectedColumns.includes(col) ? "selected" : ""
                  }`}
                >
                  {col === "s.no"
                    ? "S.No"
                    : col.replace("_", " ").toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredFileData?.map((student, index) => (
              <tr key={index}>
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`table-cell ${
                      selectedColumns.includes(col) ? "selected" : ""
                    }`}
                  >
                    {col === "s.no" ? (
                      index + 1
                    ) : student[col]==null?(
                      "-"
                    ) : col === "dob_ddmmyyyy" ? (
                      dateFormats[selectedFormat](student[col])
                    ) : col.includes("cgpa") ? (
                      parseFloat(student[col])?.toFixed(2)
                    ) : col.includes("gpa") ? (
                      parseFloat(student[col])?.toFixed(2)
                    ) : (
                      (student[col]==null||student[col]==undefined)?'-':student[col]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
