import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import {db} from "../database/firebase"
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import './style.css';
import { toast } from 'react-toastify';

const CreateStudent = () => {
    const [fileData, setFileData] = useState([]);
    const [year, setYear] = useState(0);
    const [isLoading, setIsLoading] = useState(null); 

    const notify = (message) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
    }
    const notifyFailure = (message) => {
        toast.error(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
    }
    
    const formatDate = (dateValue) => {
        if (!dateValue) return null;
        let date=null;
        if (typeof dateValue === 'number') {
            const excelStartDate = new Date(1899, 11, 30);
            const parsedDate = new Date(excelStartDate.getTime() + dateValue * 86400000);
            parsedDate.setDate(parsedDate.getDate() + 1);
            date=parsedDate.toISOString().split('T')[0];
            const parts = date.split(/[./\-]/);
            if (parts.length === 3) {
                const [year, month, day] = parts;
                return `${year}-${day.padStart(2, '0')}-${month.padStart(2, '0')}`;
            }
        }
        
        if (typeof dateValue === 'string') {
            const parts = dateValue.split(/[./\-]/);
            if (parts.length === 3) {
                const [day, month, year] = parts;
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }
    
        return null;
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setIsLoading("Extracting Excel Data");
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                let json = XLSX.utils.sheet_to_json(worksheet);

                json = json.map((row) => ({
                    ...row,
                    dob_ddmmyyyy: formatDate(row?.dob_ddmmyyyy),
                }));
                setFileData(json);
                setIsLoading(null);
                notify("Successfully Extracted.");
                console.log(json)
            };
            reader.readAsArrayBuffer(e.target.files[0]);
        
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
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
            const studentData = { ...student, year ,placed:false};
      
            if (existingRollNoMap[student.roll_no]) {
              const studentRef = doc(db, "students", existingRollNoMap[student.roll_no]);
              await updateDoc(studentRef, studentData);
            } else {
              await addDoc(studentsCollection, studentData);
            }
          }
          setIsLoading(null)
          notify("Students inserted successfully.");
        } catch (error) {
          console.error("Error processing students: ", error);
          notifyFailure("Students inserted Failed.");
        }

        try {
            setIsLoading("Insert Students Locally");
            const response = await fetch('http://localhost:5000/api/create-students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ excelData: fileData, year: year ,placed:false}),
            });

            const result = await response.json();
            if (response.ok) {
                notify("Students inserted successfully in local.");
                console.log('Server response:', result);
            } else {
                console.error('Server error:', result.message || 'Something went wrong');
            }
        } catch (err) {
            notifyFailure("Error processing students in local");
            console.error('Error updating student records:', err);
        } finally {
            setIsLoading(null);
        }

      };
      

    return (
        <Container className="update-student-container p-5">
            <main className="update-student">
                <Form>
                    <Form.Group className="mb-4">
                    <Form.Label htmlFor="year" className="elegant-label">
                            Enter Year
                        </Form.Label>
                        <Form.Control
                            type="number"
                            id='year'
                            placeholder="Enter Year (e.g., 2025)"
                            onChange={(e) => setYear(e.target.value)}
                            className="elegant-input"
                            disabled={isLoading} 
                        />
                    </Form.Group>

                    <Form.Group className="mb-4 ">
                        <Form.Label htmlFor="upload" className="elegant-label">
                            Upload Student Data (Excel File)
                        </Form.Label>
                        <div className="custom-file-upload">
                            <Form.Control
                                type="file"
                                id="upload"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="file-input"
                                disabled={isLoading} 
                            />
                            <span className="file-upload-text  py-5">Choose File</span>
                        </div>
                    </Form.Group>

                    <Button
                        onClick={handleSubmit}
                        className="submit-btn"
                        type="submit"
                        disabled={isLoading} 
                    >
                        {isLoading!==null ? (
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
                </Form>
            </main>
        </Container>
    );
};

export default CreateStudent;





































    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsLoading(true); // Start loading
    //     try {
    //         console.log("Cloud deployed started")
    //         const response = await fetch('https://placefolio.onrender.com/api/create-students', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ excelData: fileData, year: year }),
    //         });
            
    //         const result = await response.json();
    //         if (response.ok) {
    //             console.log('Cloud Server response:', result);
    //         } else {
    //             console.error('Cloud erver error:', result.message || 'Something went wrong');
    //         }
    //     } catch (err) {
    //         console.error('Error updating student records in cloud:', err);
    //     }

        
    // };
