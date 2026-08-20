import React, { useContext, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Modal, Button, Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaKey, FaChartLine, FaUser } from 'react-icons/fa';

const HeaderNavbar = () => {
  const { currentUser, logout, changePassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (oldPassword !== currentUser.password) {
      setPwError('Mật khẩu cũ không chính xác!');
      return;
    }
    if (newPassword.length < 3) {
      setPwError('Mật khẩu mới phải từ 3 ký tự trở lên!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    const res = await changePassword(currentUser.id, newPassword);
    if (res.success) {
      setPwSuccess('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordModal(false), 1500);
    } else {
      setPwError(res.message || 'Có lỗi xảy ra!');
    }
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/';
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'pdp') return '/pdp';
    if (currentUser.role === 'student' && currentUser.isPresident) return '/president';
    return '/';
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="border-bottom sticky-top shadow-sm py-2">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold text-orange d-flex align-items-center">
            <span className="fs-3 me-2">🍊</span>
            <span className="d-none d-sm-inline text-dark">FPTU CLB</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto fw-semibold">
              <Nav.Link as={Link} to="/clubs" className="px-3">CLB</Nav.Link>
              <Nav.Link as={Link} to="/events" className="px-3">Sự kiện</Nav.Link>
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
                  align="end"
                >
                  <NavDropdown.Item onClick={() => setShowProfile(true)}>
                    <FaUser className="me-2 text-primary" /> Thông tin cá nhân
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => setShowPasswordModal(true)}>
                    <FaKey className="me-2 text-warning" /> Đổi mật khẩu
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

      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Thông tin cá nhân</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentUser && (
            <div className="p-2">
              <div className="text-center mb-4">
                <FaUserCircle size={80} className="text-secondary" />
                <h4 className="mt-2 fw-bold">{currentUser.fullName}</h4>
                <span className="badge bg-primary text-capitalize px-3 py-2 fs-6">
                  {currentUser.role === 'pdp' ? 'PDP Staff' : currentUser.isPresident ? 'Chủ nhiệm CLB' : currentUser.role}
                </span>
              </div>
              <hr />
              <p><strong>Tên đăng nhập:</strong> {currentUser.username}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              {currentUser.role === 'student' && (
                <>
                  <p>
                    <strong>Vai trò hệ thống:</strong>{' '}
                    {currentUser.isPresident ? 'Chủ nhiệm CLB' : 'Sinh viên'}
                  </p>
                  {currentUser.clubId && (
                    <p><strong>Mã CLB quản lý/tham gia:</strong> {currentUser.clubId}</p>
                  )}
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfile(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Đổi mật khẩu</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordChange}>
          <Modal.Body>
            {pwError && <Alert variant="danger">{pwError}</Alert>}
            {pwSuccess && <Alert variant="success">{pwSuccess}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu hiện tại</Form.Label>
              <Form.Control 
                type="password" 
                required 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu mới</Form.Label>
              <Form.Control 
                type="password" 
                required 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Xác nhận mật khẩu mới</Form.Label>
              <Form.Control 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Hủy</Button>
            <Button type="submit" variant="primary">Đổi mật khẩu</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default HeaderNavbar;
