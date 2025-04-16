import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Container, Form, Button, Spinner, Alert } from "react-bootstrap";
import FilterStudent from "./FilterStudent";
import './style.css';

const SelectStudent = () => {
    const [regNo, setRegNo] = useState("");
    const [studentData, setData] = useState([]);
    const [filterElement, setFilterElement] = useState({});
    const [filterData, setFilterData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState(null);
    const [consolidateData,setConsolidateData]=useState([]);

    const value = {
        roll_no: [...new Set(studentData.map(student => student?.roll_no))],
        full_name: [...new Set(studentData.map(student => student?.full_name))],
        company_name: [...new Set(studentData.map(student => student?.company_name))],
        type: [...new Set(studentData.map(student => student?.type))],
        status: [...new Set(studentData.map(student => student?.status))],
        round: [...new Set(studentData.map(student => student?.round))], // Added rounds
    };

    async function handleSubmit() {
        setIsLoading(true);
        setResponseMessage(null);
        
        try {
            const res = await fetch('http://localhost:5000/api/student-record', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            
            if (res.ok) {
                setData(data?.data);
                setFilterData(data?.data);
                const students = data?.data;
                setFilterElement({
                    roll_no: [...new Set(students.map(student => student?.roll_no))].sort(),
                    full_name: [...new Set(students.map(student => student?.full_name))].sort(),
                    company_name: [...new Set(students.map(student => student?.company_name))].sort(),
                    type: [...new Set(students.map(student => student?.type))].sort(),
                    status: [...new Set(students.map(student => student?.status))].sort(),
                    round: [...new Set(students.map(student => student?.round))].sort(), // Added rounds
                });
                setResponseMessage({ type: 'success', text: 'Student records fetched successfully!' });
            }
        } catch (err) {
            setResponseMessage({ type: 'error', text: 'Error fetching student records' });
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }
    }
    console.log(consolidateData)
    const generateConsolidateReport = () => {
        if (!value?.company_name || !Array.isArray(value.company_name)) {
            console.warn("Invalid company_name data");
            return;
        }
    
        const data = value.company_name.map((company, index) => {
            // Initialize all rounds with 0
            const stats = {
                s_no: index + 1,
                company_name: company,
                Placed: 0,
                ...Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`Round${i + 1}`, 0])) // Creates { Round1: 0, Round2: 0, ..., Round7: 0 }
            };
    
            studentData.forEach(student => {
                if (student.company_name === company) {
                    const match = student.status.match(/^Round(\d)$/);
                    if (match) {
                        const roundNumber = `Round${match[1]}`;
                        stats[roundNumber]++; // Increment count for that round
                    } else if (student.status === "Placed") {
                        stats.Placed++;
                    }
                }
            });
    
            return stats;
        });
    
        setConsolidateData(data);
        downloadExcel(data);
    };
    
    const downloadExcel = (dataToExport = filterData) => {
        const filteredData = dataToExport.map(({ company_id, ...rest }) => rest);
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const fileName = prompt("Enter the name for download") || "Students";
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(data, `${fileName}.xlsx`);
    };

    // Add company-specific export
    const handleCompanyExport = (companyName) => {
        const companyData = filterData.filter(student => student.company_name === companyName);
        downloadExcel(companyData);
    };

    return (
        <Container fluid className="select-student-container">
            <main className="select-student-main">
                <section className="filter-section">
                    <div className="filter-card">
                        {studentData.length !== 0 && (
                            <>
                                <FilterStudent 
                                    filter={filterElement} 
                                    data={studentData} 
                                    setFilterData={setFilterData}
                                    onCompanyExport={handleCompanyExport}
                                />
                                <Button 
                                    onClick={handleSubmit} 
                                    className="refresh-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-arrow-clockwise me-2"></i>
                                            Refresh
                                        </>
                                    )}
                                </Button>
                                <Button 
                                        className="download-btn"
                                        onClick={() => generateConsolidateReport()}
                                        disabled={isLoading}
                                    >
                                        <i className="bi bi-download me-2"></i>
                                        Consolidate Report
                                    </Button>
                            </>
                        )}
                    </div>
                </section>

                {studentData?.length !== 0 && (
                    <section className="table-section">
                        <div className="table-card">
                            <div className="table-header w-100">
                                <div className="header-content d-flex w-100 justify-content-between">
                                    <div className="search-group">
                                        <Form.Control
                                            type="text"
                                            placeholder="Search Ex: 22EER001"
                                            className="search-input"
                                            onChange={(e) => setRegNo(e.target.value)}
                                            value={regNo}
                                            disabled={isLoading}
                                        />
                                        <Button 
                                            className="search-btn"
                                            onClick={() => setFilterData(studentData.filter(item => item.roll_no === regNo))}
                                            disabled={isLoading}
                                        >
                                            <i className="bi bi-search"></i>
                                        </Button>
                                    </div>
                                    <Button 
                                        className="download-btn"
                                        onClick={() => downloadExcel()}
                                        disabled={isLoading}
                                    >
                                        <i className="bi bi-download me-2"></i>
                                        Export to Excel
                                    </Button>
                                    
                                </div>
                            </div>

                            <div className="table-wrapper">
                                <table className="student-table">
                                    <thead>
                                        <tr>
                                            <th className="text-center">Select</th>
                                            <th className="text-center">S.No</th>
                                            <th>Roll Number</th>
                                            <th>Name</th>
                                            <th>Company Name</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filterData.length !== 0 ? (
                                            filterData.map((student, index) => (
                                                <tr key={index}>
                                                    <td className="text-center">
                                                        <Form.Check type="checkbox" disabled={isLoading} />
                                                    </td>
                                                    <td className="text-center">{index + 1}</td>
                                                    <td>{student.roll_no}</td>
                                                    <td>{student.full_name}</td>
                                                    <td>{student.company_name}</td>
                                                    <td>{student.type}</td>
                                                    <td><span className="status-badge">{student.status}</span></td>
                                                    <td>{new Date(student.date)?.toISOString().split("T")[0]}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={9} className="no-data">No data found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {responseMessage && (
                            <Alert variant={responseMessage.type === 'success' ? 'success' : 'danger'} className="response-alert">
                                {responseMessage.text}
                            </Alert>
                        )}
                    </section>
                )}

                {studentData?.length === 0 && (
                    <section className="empty-section">
                        <div className="empty-card">
                            <h3 className="empty-title">Student's Record</h3>
                            <p className="empty-text">Fetch student records to begin viewing data.</p>
                            <Button 
                                onClick={handleSubmit} 
                                className="fetch-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Fetching...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-database-fill me-2"></i>
                                        Get Student Records
                                    </>
                                )}
                            </Button>
                            {responseMessage && (
                                <Alert variant={responseMessage.type === 'success' ? 'success' : 'danger'} className="response-alert">
                                    {responseMessage.text}
                                </Alert>
                            )}
                        </div>
                    </section>
                )}
            </main>
        </Container>
    );
};

export default SelectStudent;