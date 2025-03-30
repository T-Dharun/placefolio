import { useState } from 'react';
import { Button, Modal, Form,Spinner } from 'react-bootstrap';
import "./style.css"
const filterKey = ["company_name", "full_name", "roll_no", "status", "type"];

function FilterStudent(props) {
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState({});
  const [currentFilter, setCurrentFilter] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function handleFilterChanges() {
    setIsApplying(true);
    const value = props.data.filter(item => {
      if (currentFilter && filter[currentFilter] && item[currentFilter] === filter[currentFilter]) {
        return item;
      }
      return false;
    });
    props.setFilterData(value.length > 0 ? value : props.data); // Reset to full data if no matches
    setTimeout(() => {
      setIsApplying(false);
      handleClose();
    }, 500); // Simulate processing delay for better UX
  }

  const formatKeyName = (key) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
              <div className="filter-selection-group">
                <Form.Group className="mb-3">
                  <Form.Label className="filter-label">Filter By</Form.Label>
                  <Form.Select
                    id="filterKey"
                    className="filter-select"
                    value={currentFilter}
                    onChange={(e) => setCurrentFilter(e.target.value)}
                  >
                    <option value="">Select Filter Category</option>
                    {filterKey.map((type, index) => (
                      <option key={index} value={type}>
                        {formatKeyName(type)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {currentFilter && (
                  <Form.Group className="mb-3 filter-value-group">
                    <Form.Label className="filter-label">Value</Form.Label>
                    <Form.Select
                      id="filterValue"
                      className="filter-select"
                      onChange={(e) => setFilter({ [currentFilter]: e.target.value })}
                      disabled={!currentFilter || !props.filter[currentFilter]}
                    >
                      <option value="">Select Value</option>
                      {props?.filter[currentFilter]?.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}
              </div>
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
              onClick={handleFilterChanges}
              disabled={!currentFilter || !filter[currentFilter] || isApplying}
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