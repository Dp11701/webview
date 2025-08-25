import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Settings from "./pages/Settings";
import Navigation from "./components/Navigation";

export default function App() {
  return (
    <Router>
      <div className="pb-20">
        {" "}
        {/* Add padding bottom to account for fixed navigation */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
      {/* <Navigation /> */}
    </Router>
  );
}
