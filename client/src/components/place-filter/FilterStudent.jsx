import { useState } from 'react';
import { Button, Modal, Form, Spinner } from 'react-bootstrap';
import "./style.css";

const filterKey = ["company_name", "full_name", "roll_no", "status", "type", "round"];

function FilterStudent({ filter, data, setFilterData, onCompanyExport }) {
  const [show, setShow] = useState(false);
  const [filterValues, setFilterValues] = useState({
    company_name: '',
    status: '',
    round: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const [isApplying, setIsApplying] = useState(false);
  console.log(filterValues)
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const applyFilters = () => {
    setIsApplying(true);
    let filtered = [...data];

    // Company filter
    if (filterValues.company_name) {
      filtered = filtered.filter(item => item.company_name === filterValues.company_name);
    }

    // Status filter (especially for placed/not placed)
    if (filterValues.status) {
      filtered = filtered.filter(item => item.status === filterValues.status);
    }

    // Round filter
    if (filterValues.round) {
      filtered = filtered.filter(item => item.round === filterValues.round);
    }

    // Date range filter
    if (filterValues.dateFrom || filterValues.dateTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        const fromDate = filterValues.dateFrom ? new Date(filterValues.dateFrom) : null;
        const toDate = filterValues.dateTo ? new Date(filterValues.dateTo) : null;
        console.log(itemDate,fromDate,toDate)
        
        return (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);
      });
    }

    setFilterData(filtered.length > 0 ? filtered : []);
    setTimeout(() => {
      setIsApplying(false);
      handleClose();
    }, 500);
  };

  const formatKeyName = (key) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleInputChange = (key, value) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Button className="filter-trigger-btn" onClick={handleShow}>
        <i className="bi bi-funnel me-2"></i>Filter Students
      </Button>

      <Modal 
        show={show} 
        onHide={handleClose} 
        className="filter-modal-premium"
        centered
        backdrop="static"
        animation={true}
      >
        <div className="filter-modal-content">
          <Modal.Header className="filter-modal-header">
            <Modal.Title className="filter-modal-title">
              <i className="bi bi-filter-circle me-2"></i>Filter Student Records
            </Modal.Title>
            <Button variant="" className="close-btn" onClick={handleClose}>
              <i className="bi bi-x-lg"></i>
            </Button>
          </Modal.Header>

          <Modal.Body className="filter-modal-body">
            <Form>
              {/* Company Name Filter */}
              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Select
                  value={filterValues.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                >
                  <option value="">All Companies</option>
                  {filter.company_name?.map((company, index) => (
                    <option key={index} value={company}>{company}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Status Filter */}
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filterValues.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {filter.status?.map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </Form.Group>


              {/* Date Range Filter */}
              <Form.Group className="mb-3">
                <Form.Label>Date Range</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="date"
                    value={filterValues.dateFrom}
                    onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                  />
                  <Form.Control
                    type="date"
                    value={filterValues.dateTo}
                    onChange={(e) => handleInputChange('dateTo', e.target.value)}
                  />
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer className="filter-modal-footer">
            <Button 
              variant="" 
              className="cancel-btn" 
              onClick={handleClose}
              disabled={isApplying}
            >
              Cancel
            </Button>
            <Button 
              variant="" 
              className="apply-btn" 
              onClick={applyFilters}
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Applying...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-2"></i>
                  Apply Filter
                </>
              )}
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
}

export default FilterStudent;