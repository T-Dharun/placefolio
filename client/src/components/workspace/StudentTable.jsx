import React from 'react';
import { Form } from 'react-bootstrap';
import "./style.css"

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
    `cgpa_${filter.semester}sem`
  ];

  return (
    <div className="student-table-container   p-0">
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

      <div className="table-wrapper p-0">
        <table className="student-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => toggleColumnSelection(col)}
                  className={`table-header ${
                    selectedColumns.includes(col) ? 'selected' : ''
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
                      selectedColumns.includes(col) ? 'selected' : ''
                    }`}
                  >
                    {col === "s.no" ? (
                      index + 1
                    ) : col === "dob_ddmmyyyy" ? (
                      dateFormats[selectedFormat](student[col])
                    ) : col.includes("cgpa") ? (
                      parseFloat(student[col])?.toFixed(2)
                    ) : (
                      student[col]
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