import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Импорт страниц
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import CreateSubmission from './pages/CreateSubmission';
import Schedule from './pages/Schedule';
import Contacts from './pages/Contacts';
import AcceptedSubmissions from './pages/AcceptedSubmissions';
import NewsPage from './pages/NewsPage';


// ...
// 1. ИМПОРТИРУЕМ НОВЫЕ СТРАНИЦЫ
import Archive from './pages/Archive';
import ArchiveDetails from './pages/ArchiveDetails';
import PendingVerification from './pages/PendingVerification';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
     if(localStorage.getItem("token")){
         setIsAuthenticated(true);
     }
  }, []);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  return (
    <Router>
      <div className="container">
        <Routes> 
          
          {/* Главная страница */}
          <Route path="/" element={<Home />} />

          {/* Публичные страницы */}
          <Route path="/schedule" element={<Schedule />} />
          
          {/* 2. ДОБАВЛЯЕМ МАРШРУТЫ АРХИВА */}
          <Route path="/archive" element={<Archive />} />
          <Route path="/archive/:id" element={<ArchiveDetails />} />

          {/* Авторизация */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login setAuth={setAuth} /> : <Navigate to="/dashboard" />} 
          />
          
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register setAuth={setAuth} /> : <Navigate to="/dashboard" />} 
          />

          <Route path="/pending-verification" element={<PendingVerification />} />

          {/* Защищенные маршруты (Личный кабинет) */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard setAuth={setAuth} /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/create-submission" 
            element={isAuthenticated ? <CreateSubmission /> : <Navigate to="/login" />} 
          />

          <Route path="/submissions" element={<AcceptedSubmissions />} />

          <Route path="/contacts" element={<Contacts />} />
          {/* Если страница не найдена -> на Главную */}
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/news" element={<NewsPage />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
