import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HeaderNavbar from './components/HeaderNavbar';
import Footer from './components/Footer';
import Homepage from './pages/Homepage';
import Login from './pages/auth/Login';
import ClubList from './pages/student/ClubList';
import ClubDetail from './pages/student/ClubDetail';
import EventList from './pages/student/EventList';
import EventDetail from './pages/student/EventDetail';
import NewsList from './pages/student/NewsList';
import NewsDetail from './pages/student/NewsDetail';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Unauthorized from './pages/auth/Unauthorized';
import AdminDashboard from './pages/admin/AdminDashboard';
import PdpDashboard from './pages/pdp/PdpDashboard';
import './App.css';

const UserLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <HeaderNavbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<UserLayout />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/clubs" element={<ClubList />} />
            <Route path="/clubs/:id" element={<ClubDetail />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/news" element={<NewsList />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Homepage />} />
          </Route>

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/pdp" element={<PdpDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
