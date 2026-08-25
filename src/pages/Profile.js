import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

const Profile = () => {
  const { currentUser, changePassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

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
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else {
      setPwError(res.message || 'Có lỗi xảy ra!');
    }
  };

  if (!currentUser) return null;

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h1 className="fw-bold">Hồ sơ cá nhân</h1>
        <p className="text-muted">Quản lý thông tin tài khoản và bảo mật mật khẩu của bạn</p>
      </div>

      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm p-4 text-center h-100">
            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
              <FaUserCircle size={100} className="text-secondary mb-3" />
              <h3 className="fw-bold">{currentUser.fullName}</h3>
              <span className="badge bg-primary px-3 py-2 fs-6 mb-4 text-capitalize">
                {currentUser.role === 'pdp' ? 'PDP Staff' : currentUser.isPresident ? 'Chủ nhiệm CLB' : currentUser.role}
              </span>
              <hr className="w-100" />
              <div className="text-start mt-4 w-100">
                <p className="mb-2"><strong>Tên đăng nhập:</strong> {currentUser.username}</p>
                <p className="mb-2"><strong>Email:</strong> {currentUser.email}</p>
                {currentUser.code && <p className="mb-2"><strong>Mã sinh viên/nhân viên:</strong> {currentUser.code}</p>}
                {currentUser.dob && <p className="mb-2"><strong>Ngày sinh:</strong> {currentUser.dob}</p>}
                <p className="mb-0">
                  <strong>Quyền hạn:</strong>{' '}
                  {currentUser.role === 'admin'
                    ? 'Quản trị viên'
                    : currentUser.role === 'pdp'
                      ? 'PDP Staff'
                      : currentUser.isPresident
                        ? 'Chủ nhiệm Câu lạc bộ'
                        : 'Sinh viên'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm p-4 h-100">
            <Card.Body>
              <h4 className="fw-bold mb-4">Đổi mật khẩu</h4>

              {pwError && <Alert variant="danger">{pwError}</Alert>}
              {pwSuccess && <Alert variant="success">{pwSuccess}</Alert>}

              <Form onSubmit={handlePasswordChange}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Mật khẩu hiện tại <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showOldPassword ? "text" : "password"}
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <InputGroup.Text 
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      style={{ cursor: 'pointer', backgroundColor: 'transparent' }}
                    >
                      {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Mật khẩu mới <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <InputGroup.Text 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ cursor: 'pointer', backgroundColor: 'transparent' }}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    Xác nhận mật khẩu mới <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <InputGroup.Text 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ cursor: 'pointer', backgroundColor: 'transparent' }}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>

                <Button type="submit" variant="primary" className="px-4 py-2 rounded-pill fw-semibold">
                  Cập nhật mật khẩu
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
