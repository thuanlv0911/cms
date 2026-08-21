import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaChartLine, FaUser } from 'react-icons/fa';

const HeaderNavbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/';
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'pdp') return '/pdp';
    if (currentUser.role === 'student' && currentUser.isPresident) return '/president';
    return '/';
  };

  return (
    <Navbar expand="lg" className="navbar-light-orange sticky-top shadow-sm py-2">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src="/images/logo_FPTU.svg" alt="Logo FPTU" height="40" />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto fw-semibold">
            <Nav.Link as={Link} to="/clubs" className="px-3">CLB</Nav.Link>
            <Nav.Link as={Link} to="/events" className="px-3">Sự kiện</Nav.Link>
            <Nav.Link as={Link} to="/news" className="px-3">Tin tức</Nav.Link>
            <Nav.Link as={Link} to="/contact" className="px-3">Liên hệ</Nav.Link>
          </Nav>

          <Nav className="align-items-center">
            {currentUser ? (
              <NavDropdown
                title={
                  <span className="d-flex align-items-center cursor-pointer">
                    <FaUserCircle size={26} className="text-secondary me-2" />
                    <span className="text-dark fw-semibold">{currentUser.fullName}</span>
                  </span>
                }
                id="user-dropdown"
                className="user-dropdown-no-caret"
                align="end"
              >
                <NavDropdown.Item onClick={() => navigate('/profile')}>
                  <FaUser className="me-2 text-primary" /> Trang cá nhân
                </NavDropdown.Item>
                
                {(currentUser.role === 'pdp' || currentUser.role === 'admin' || (currentUser.role === 'student' && currentUser.isPresident)) && (
                  <NavDropdown.Item onClick={() => navigate(getDashboardPath())}>
                    <FaChartLine className="me-2 text-success" /> Dashboard
                  </NavDropdown.Item>
                )}
                
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  <FaSignOutAlt className="me-2" /> Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button as={Link} to="/login" variant="outline-primary" className="fw-semibold px-4 rounded-pill">
                Đăng nhập
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HeaderNavbar;
