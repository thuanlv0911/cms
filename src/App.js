import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HeaderNavbar from './components/HeaderNavbar';
import Footer from './components/Footer';
import Homepage from './pages/Homepage';
import Login from './pages/auth/Login';
import BrowseClubs from './pages/student/BrowseClubs';
import ClubDetail from './pages/student/ClubDetail';
import EventCalendar from './pages/student/EventCalendar';
import Unauthorized from './pages/auth/Unauthorized';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-light">
          {/* Navbar luôn hiển thị */}
          <HeaderNavbar />
          
          {/* Nội dung chính của các trang */}
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/clubs" element={<BrowseClubs />} />
              <Route path="/clubs/:id" element={<ClubDetail />} />
              <Route path="/events" element={<EventCalendar />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<Homepage />} />
            </Routes>
          </main>
          
          {/* Footer luôn hiển thị */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
