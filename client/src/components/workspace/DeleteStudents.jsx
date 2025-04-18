import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import {db} from '../database/firebase';
import "./style.css";
import { notify, notifyFailure } from './notification';
const DeleteStudents = () => {
  const [year, setYear] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  
  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  
  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      const studentsCollection = collection(db, "students");
      const q = query(studentsCollection, where("year", "==", year)); 
  
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        notify(`No students found with year ${year}.`);
        return;
      }
  
      const deletePromises = querySnapshot.docs.map((docSnap) => 
        deleteDoc(doc(db, "students", docSnap.id))
      );
  
      await Promise.all(deletePromises);
  
      notify(`${querySnapshot?.size} students of year ${year} have been deleted.`);
    } catch (error) {
      notifyFailure("Failed to delete students.");
      console.error("Error deleting documents: ", error);
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















































// const handleDelete = async (e) => {
//   //   e.preventDefault();
    
  //   if (!year) {
  //     setError('Year is required');
  //     return;
  //   }

  //   try {
  //     // Send the DELETE request
  //     const response = await axios.delete(`http://localhost:5000/api/delete-students/${year}`);

  //     if (response.status === 200) {
  //       setSuccessMessage(response.data.message);
  //       setError(null);  // Clear previous errors
  //     }
  //   } catch (err) {
  //     // Handle errors
  //     if (err.response) {
  //       // If the error is from the server
  //       setError(err.response.data.error || 'An error occurred');
  //     } else {
  //       // If the error is a network issue
  //       setError('Network error, please try again later');
  //     }
  //   }
  // };