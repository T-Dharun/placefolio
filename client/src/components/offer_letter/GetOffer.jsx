import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { db } from '../database/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Container, Row, Col, Table, Button, Alert, Spinner, Card, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./GetOffer.css"

const GetOffer = () => {
  const [data, setData] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const studentsCollection = collection(db, "students");
      const studentsSnapshot = await getDocs(studentsCollection);
      const originalFileData = studentsSnapshot.docs.map(doc => doc.data());

      const parsedData = originalFileData
        .map((row) => {
          const {full_name, roll_no, offer_letter } = row;
          const fileIdMatch = offer_letter?.match(/\/d\/(.+?)\//);
          const fileId = fileIdMatch ? fileIdMatch[1] : null;

          if (!roll_no || !fileId) return null;
          return {full_name, roll_no, fileId };
        })
        .filter(Boolean);

      setData(parsedData);
      setSelectedStudents(parsedData.map((_, index) => index)); // Select all by default
    } catch (err) {
      setError('Failed to fetch student data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const BACKEND_URL = 'http://localhost:5000';


  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(data.map((_, index) => index));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (index) => {
    if (selectedStudents.includes(index)) {
      setSelectedStudents(selectedStudents.filter((i) => i !== index));
    } else {
      setSelectedStudents([...selectedStudents, index]);
    }
  };

  const handleGenerate = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student to generate the PDF');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const selectedData = selectedStudents.map((index) => data[index]);
      const response = await axios.post(`${BACKEND_URL}/api/generate`, { offerLetters: selectedData }, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'combined_offer_letter.pdf';
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };
  console.log(data)
  return (
    <Container className="py-5 min-vh-100 w-100">
      <Row className="justify-content-center w-100">
        <Col md={16} lg={8} className='w-100' >
          <Card className="rounded-3">
            <Card.Body className="p-5 w-100">
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              {isLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading data...</p>
                </div>
              ) : data.length > 0 ? (
                <>
                  <div className="table-responsive w-100">
                    <Table striped bordered hover className="mt-4">
                      <thead className="bg-light">
                        <tr className='table-heading-offer'>
                          <th className="px-4 py-3">
                            <Form.Check
                              type="checkbox"
                              checked={selectedStudents.length === data.length}
                              onChange={handleSelectAll}
                              label="Select All"
                            />
                          </th>
                          <th className="px-4 py-3">S.No</th>
                          <th className="px-4 py-3">Roll No</th>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Drive Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, index) => (
                          <tr key={index} className="transition-colors">
                            <td className="px-4 py-3">
                              <Form.Check
                                type="checkbox"
                                checked={selectedStudents.includes(index)}
                                onChange={() => handleSelectStudent(index)}
                              />
                            </td>
                            <td className="px-4 py-3">{index + 1}</td>
                            <td className="px-4 py-3">{row.roll_no}</td>
                            <td className="px-4 py-3">{row.full_name}</td>
                            <td className="px-4 py-3 truncate" style={{ maxWidth: '200px' }}>
                              <a
                                href={`https://drive.google.com/file/d/${row.fileId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary"
                              >
                                {row.fileId}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={loading || selectedStudents.length === 0}
                    className="offer-generate-button"
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Generating...
                      </>
                    ) : (
                      'Generate PDF'
                    )}
                  </Button>
                </>
              ) : (
                <p className="text-center text-muted py-5">
                  No data available. Upload an Excel file or fetch student data.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GetOffer;