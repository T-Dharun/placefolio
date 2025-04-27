import React, { useRef, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import "./style.css";

const StudentTable = ({
  filteredFileData,
  columns,
  dateFormats,
  toggleColumnSelection,
  selectedColumns,
  selectedFormat,
  setSelectedFormat
}) => {
  
  return (
    <div className="student-table-container">
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

      <div className="table-wrapper-1 p-0">
        <table className="student-table">
          <thead className='sticky-top'>
            <tr>
              {columns?.map((col, index) => (
                <th
                  key={index}
                  onClick={() => toggleColumnSelection(col)}
                  className={`table-header  ${
                    selectedColumns.includes(col) ? "selected" : ""
                  }`}
                >
                  {col!==undefined && col === "s.no"
                    ? "S.No"
                    : col.replace("_", " ").toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredFileData?.map((student, index) => (
              <tr key={index}>
                {columns?.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`table-cell ${
                      selectedColumns.includes(col) ? "selected" : ""
                    }`}
                  >
                    {
                    col === "s.no" ? (
                      index + 1
                    ) : student[col]==null?(
                      "-"
                    ) : col === "dob_ddmmyyyy" ? (
                      dateFormats[selectedFormat](student[col])
                    ) : col.includes("cgpa") ? (
                      parseFloat(student[col])?.toFixed(2)
                    ) : col.includes("gpa") ? (
                      parseFloat(student[col])?.toFixed(2)
                    ) : col === 'placed' ? (
                      student[col]?"Placed":"Not Placed"
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
