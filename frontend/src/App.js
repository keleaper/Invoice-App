import React from "react";
import Login from "./components/login.jsx";
import Register  from "./components/register.jsx";
import Invoices from "./components/invoices.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import './App.css';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/register" element={<Register />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;