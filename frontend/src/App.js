import React from "react";
import Login from "./components/login.js";
import Register  from "./components/register.js";
import Invoices from "./components/invoices.js";
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