import React, { useState } from 'react';
import './App.css';
import Login from './pages/Login.js';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from './pages/Dashboard.js';
import Cookies from 'js-cookie';
import { Navigate } from 'react-router-dom';



const App = () => {
  const isAccessTokenPresent = !!Cookies.get('access_token');


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {isAccessTokenPresent ? (
          <Route path="/dashboard" element={<Dashboard />} />
        ) : (
          <Route path="/login" element={<Login />} />
        )}

      </Routes>
    </BrowserRouter>
  );
};

export default App;