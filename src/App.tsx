import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Menu from "./components/Menu";
import Header from "./components/Header";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<><Menu /><Header /></>} />
    </Routes>
  );
}

export default App;