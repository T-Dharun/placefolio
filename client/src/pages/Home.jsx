import { useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import CreateStudent from "../components/workspace/CreateStudent";
import DeleteStudents from "../components/workspace/DeleteStudents";
import FilterStudentEligible from "../components/workspace/FilterStudentEligible";
import UpdateCompany from "../components/place-filter/UpdateCompany";
import SelectStudent from "../components/place-filter/SelectStudent";
import './PageStyle.css';

const Home = () => {
  const [sidebar, setSidebar] = useState(0);

  const renderContent = () => {
    switch (sidebar) {
      case 0:
        return <CreateStudent />;
      case 1:
        return <UpdateCompany />;
      case 2:
        return <DeleteStudents />;
      case 3:
        return <SelectStudent />;
      case 4:
        return <FilterStudentEligible />;
      default:
        return (
          <div className="no-route-container">
            <h2 className="no-route-title">No Route Found</h2>
            <p className="no-route-text">Please select an option from the sidebar.</p>
          </div>
        );
    }
  };

  return (
    <div className="home-premium">
      <Sidebar setSidebar={setSidebar} />
      <main className="content-wrapper">
        <header className="content-header">
          <h1 className="header-title">
            {sidebarValue[sidebar]?.value 
              ? `${sidebarValue[sidebar].value.replace(/([A-Z])/g, ' $1').trim()} Dashboard`
              : 'Placement Dashboard'}
          </h1>
        </header>
        <section className="content-body">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

// Sidebar values for reference (could be moved to a separate file)
const sidebarValue = [
  { key: 0, value: 'CreateStudent' },
  { key: 1, value: 'UpdateCompany' },
  { key: 2, value: 'DeleteStudent' },
  { key: 3, value: 'FilterStudent' },
  { key: 4, value: 'EligibleStudent' },
];

export default Home;