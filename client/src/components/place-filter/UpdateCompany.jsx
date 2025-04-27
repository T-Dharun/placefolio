import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { db } from "../database/firebase"
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { toast } from 'react-toastify';
import { notify ,notifyFailure} from "../workspace/notification"
import "./style.css"

const companyTypes = ["Software", "Core"];
const companyStatus = ["Round1", "Round2", "Round3", "Round4", "Round5", "Round6", "Round7", "Round8", "Placed"];

function UpdateCompany() {
    const [fileData, setFileData] = useState([]);
    const [companyNames, setCompanyNames] = useState([]);
    const [singleUser, setSingleUser] = useState(false);
    // const [studentData, setData] = useState({ RegNo: "", Name: "" });
    const [company, setCompany] = useState({
        companyName: "select",
        companyType: "select",
        status: "select",
        date: ""
    });
    const [isLoading, setIsLoading] = useState(null); 
    const [responseMessage, setResponseMessage] = useState(null); 

    const handleCompanyList = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/company');
            const result = await response.json();
            if (response.ok) {
                setCompanyNames([...new Set(result.data?.map((item) => item.company_name))]);

            } else {
                console.error('Server error:', result.message || 'Something went wrong');
            }
        } catch (err) {
            console.error('Error fetching company list:', err);
        }
    };

    useEffect(() => {
        handleCompanyList();
    }, []);

    const handleFileChange = (e) => {
        setIsLoading("Extracting Data");
        if (e.target.files) {
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                console.log(json)
                const result = json.filter(row =>
                    (row['Reg No'] && row['Reg No'].includes('EE')) ||
                    (row['Roll No'] && row['Roll No'].includes('EE')) ||
                    (row['roll_no'] && row['roll_no'].includes('EE'))
                );
                setFileData(result);
            };
            
            reader.readAsArrayBuffer(e.target.files[0]);
            
        }
        setIsLoading(null);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResponseMessage(null);

        if (singleUser) {
            setFileData([studentData]);
        }
        if (company.companyName === "select" || company.status === "select" ||
            company.date === "" || company.companyType === "select") {
            setResponseMessage({ type: 'warning', text: 'Please fill all the fields.' });
            setIsLoading(false);
            return;
        }
        if (company?.status === "Placed") {
            try {
                setIsLoading("Processing Students");
                const studentsCollection = collection(db, "students");
                const allStudentsSnapshot = await getDocs(studentsCollection);

                const existingRollNoMap = {};
                allStudentsSnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    if (data.roll_no) {
                        existingRollNoMap[data.roll_no] = docSnap.id;
                    }
                });

                for (let student of fileData) {
                    const studentData = { ...student, placed:true};

                    if (existingRollNoMap[student?.roll_no]) {
                        const studentRef = doc(db, "students", existingRollNoMap[student.roll_no]);
                        await updateDoc(studentRef, studentData);
                    }
                }
                setIsLoading(null)
                notify("Students updated successfully.");
            } catch (error) {
                console.error("Error processing students: ", error);
                notifyFailure("Students updated Failed.");
            }
        }
        console.log(fileData)
        try {
            setIsLoading("Updating Student Data");
            if(fileData.length===0) throw new Error("No data to update");
            const response = await fetch('http://localhost:5000/api/create-student-company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: company.companyName,
                    companyType: company.companyType,
                    status: company.status,
                    excelData: fileData,
                    date: company.date
                }),
            });

            const result = await response.json();
            console.log(result)
            if (response.ok) {
                setResponseMessage({ type: 'success', text: result.message });
                toast.success('Data Register Successfully', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                });
            } else {
                setResponseMessage({ type: 'error', text: result.message || 'Unable to store data' });
                toast.error('Unable to Store Data', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                });
            }
        } catch (err) {
            setResponseMessage({ type: 'Error', text: err?.message || 'Error updating company data' });
            console.error('Error updating company:', err);
        } finally {
            setIsLoading(null);
        }
    };

    const handleCreateCompany = () => {
        const value = prompt("Enter Company Name");
        if (value?.trim() !== "") {
            setCompanyNames([...companyNames, value]);
        }
    };

    return (
        <Container className="update-company-container">
            <main className="update-company">
                <Form>
                    <div className="company-add-group">
                        <Form.Select
                            id="companyName"
                            value={company.companyName}
                            onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                            className="elegant-select"
                            disabled={isLoading}
                        >
                            <option value="select">Company Name</option>
                            {companyNames.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </Form.Select>
                        <Button
                            onClick={handleCreateCompany}
                            className="add-btn"
                            disabled={isLoading}
                        >
                            Add
                        </Button>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Select
                            id="companyType"
                            value={company.companyType}
                            onChange={(e) => setCompany({ ...company, companyType: e.target.value })}
                            className="elegant-select"
                            disabled={isLoading}
                        >
                            <option value="select">Select Company Type</option>
                            {companyTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Select
                            id="status"
                            value={company.status}
                            onChange={(e) => setCompany({ ...company, status: e.target.value })}
                            className="elegant-select"
                            disabled={isLoading}
                        >
                            <option value="select">Select Company Status</option>
                            {companyStatus.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Control
                            type="date"
                            id="date"
                            value={company.date}
                            onChange={(e) => setCompany({ ...company, date: e.target.value })}
                            className="elegant-input"
                            disabled={isLoading}
                        />
                    </Form.Group>

                    {/* <Button
                        onClick={() => setSingleUser(!singleUser)}
                        className="toggle-btn mb-3"
                        disabled={isLoading}
                    >
                        {singleUser ? "Multi User" : "Single User"}
                    </Button> */}

                    {singleUser ? (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    value={studentData.RegNo}
                                    onChange={(e) => setData({ ...studentData, RegNo: e.target.value })}
                                    className="elegant-input"
                                    placeholder="Enter Reg No"
                                    disabled={isLoading}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    value={studentData.Name}
                                    onChange={(e) => setData({ ...studentData, Name: e.target.value })}
                                    className="elegant-input"
                                    placeholder="Enter Name"
                                    disabled={isLoading}
                                />
                            </Form.Group>
                        </>
                    ) : (
                        <Form.Group className="mb-3">
                            <Form.Label className="elegant-label">Upload Sheet</Form.Label>
                            <div className="custom-file-upload">
                                <Form.Control
                                    type="file"
                                    id="upload"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="file-input"
                                    disabled={isLoading}
                                />
                                <span className="file-upload-text">Choose File</span>
                            </div>
                        </Form.Group>
                    )}

                    <Button
                        onClick={handleSubmit}
                        className="submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading!=null ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                {isLoading}...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </Button>

                    {responseMessage && (
                        <Alert
                            variant={responseMessage.type === 'success' ? 'success' :
                                responseMessage.type === 'error' ? 'danger' : 'warning'}
                            className="response-alert mt-3"
                        >
                            {responseMessage.text}
                        </Alert>
                    )}
                </Form>
            </main>
        </Container>
    );
}

export default UpdateCompany;