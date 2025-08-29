import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Settings from "./pages/Settings";
import Store from "./pages/Store";
import Wallet from "./pages/Coin";

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
          <Route path="/store" element={<Store />} />
          <Route path="/wallet" element={<Wallet />} />
        </Routes>
      </div>
      {/* <Navigation /> */}
    </Router>
  );
}
