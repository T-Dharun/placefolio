import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GetOffer from "./components/offer_letter/GetOffer";

function App() {
  return (
    
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="*" element={<>Not found</>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;