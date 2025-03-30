import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import "./style.css";
const DeleteStudents = () => {
  const [year, setYear] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input change
  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  // Handle the delete request
  const handleDelete = async (e) => {
    e.preventDefault();
    
    if (!year) {
      setError('Year is required');
      return;
    }

    try {
      // Send the DELETE request
      const response = await axios.delete(`http://localhost:5000/api/delete-students/${year}`);

      if (response.status === 200) {
        setSuccessMessage(response.data.message);
        setError(null);  // Clear previous errors
      }
    } catch (err) {
      // Handle errors
      if (err.response) {
        // If the error is from the server
        setError(err.response.data.error || 'An error occurred');
      } else {
        // If the error is a network issue
        setError('Network error, please try again later');
      }
    }
  };

  return (
      <Container className="delete-students-container">
      <div className="delete-students-wrapper">
        <Form onSubmit={handleDelete}>
          <Form.Group className="mb-4">
            <Form.Label htmlFor="year" className="elegant-label">
              Enter Year
            </Form.Label>
            <Form.Control
              type="text"
              id="year"
              name="year"
              value={year}
              onChange={handleYearChange}
              placeholder="Enter year (e.g., 2025)"
              className="elegant-input"
            />
          </Form.Group>

          <Button type="submit" className="delete-btn">
            Delete Students
          </Button>
        </Form>

        {error && <div className="error-alert">{error}</div>}
        {successMessage && <div className="success-alert">{successMessage}</div>}
      </div>
    </Container>
  );
};

export default DeleteStudents;
