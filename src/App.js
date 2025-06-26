import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import { Login } from './component/Login';
import AdminFormData from './component/AdminFormData';
import FormData from './component/FormData';
import Signup from './component/SignUp';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/adminFormData" element={<AdminFormData />} />
        <Route path="/formData" element={<FormData />} />
        <Route path="/signUp" element={<Signup />} />
      </Routes>
    </Router>
  );
};
