import { useState } from 'react';
import './Sidebar.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const sidebarValue = [
  { key: 0, value: 'AddStudent', icon: 'bi-person-plus-fill' },
  { key: 1, value: 'UpdateRecord', icon: 'bi-pencil-square' },
  { key: 2, value: 'DeleteBatch', icon: 'bi-trash-fill' },
  { key: 3, value: 'FilterStudent', icon: 'bi-filter-square-fill' },
  { key: 4, value: 'EligibleStudent', icon: 'bi-check-circle-fill' },
];

const Sidebar = ({ setSidebar }) => {
  const [activeItem, setActiveItem] = useState(null);

  const formatText = (text) => {
    return text
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^./, str => str.toUpperCase());
  };

  return (
    <nav className="sidebar-premium">
      <div className="sidebar-header">
        <h3 className="sidebar-title">PlaceFolio</h3>
      </div>
      <ul className="sidebar-menu">
        {sidebarValue.map(item => (
          <li 
            key={item.key} 
            className={`sidebar-item ${activeItem === item.key ? 'active' : ''}`}
            onMouseEnter={() => setActiveItem(item.key)}
            onMouseLeave={() => setActiveItem(null)}
          >
            <button 
              className="sidebar-btn"
              onClick={() => setSidebar(item.key)}
            >
              <i className={`bi ${item.icon} me-2 px-3`}></i>
              <span className="btn-text">{formatText(item.value)}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;