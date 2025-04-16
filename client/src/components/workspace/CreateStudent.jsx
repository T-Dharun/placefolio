import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import './style.css';

const CreateStudent = () => {
    const [fileData, setFileData] = useState([]);
    const [year, setYear] = useState(0);
    const [isLoading, setIsLoading] = useState(false); // New loading state

    // Function to convert Excel serial numbers or formatted dates to YYYY-MM-DD
    const formatDate = (dateValue) => {
        if (!dateValue) return null;
    
        if (typeof dateValue === 'number') {
            const excelStartDate = new Date(1899, 11, 30);
            const parsedDate = new Date(excelStartDate.getTime() + dateValue * 86400000);
            parsedDate.setDate(parsedDate.getDate() + 1);
            return parsedDate.toISOString().split('T')[0];
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

    // Handle file upload and parse Excel data
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
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
            };
            reader.readAsArrayBuffer(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading
        try {
            const response = await fetch('https://placefolio.onrender.com/api/create-students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ excelData: fileData, year: year }),
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Cloud Server response:', result);
            } else {
                console.error('Cloud erver error:', result.message || 'Something went wrong');
            }
        } catch (err) {
            console.error('Error updating student records in cloud:', err);
        }

        try {
            const response = await fetch('http://localhost:5000/api/create-students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ excelData: fileData, year: year }),
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Server response:', result);
            } else {
                console.error('Server error:', result.message || 'Something went wrong');
            }
        } catch (err) {
            console.error('Error updating student records:', err);
        } finally {
            setIsLoading(false); // Stop loading regardless of success or failure
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
                            disabled={isLoading} // Disable input during loading
                        />
                    </Form.Group>

                    <Form.Group className="mb-4">
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
                                disabled={isLoading} // Disable file input during loading
                            />
                            <span className="file-upload-text">Choose File</span>
                        </div>
                    </Form.Group>

                    <Button
                        onClick={handleSubmit}
                        className="submit-btn"
                        type="submit"
                        disabled={isLoading} // Disable button during loading
                    >
                        {isLoading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Processing...
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