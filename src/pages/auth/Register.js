import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validations
    if (!code.trim() || !fullName.trim() || !dob || !email.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ các trường thông tin!');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp!');
      setLoading(false);
      return;
    }

    if (password.length < 3) {
      setError('Mật khẩu phải từ 3 ký tự trở lên!');
      setLoading(false);
      return;
    }

    try {
      // Check duplicate email or student code
      const allUsers = await authService.getAllUsers();

      const emailExists = allUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (emailExists) {
        setError('Email này đã được sử dụng!');
        setLoading(false);
        return;
      }

      const codeExists = allUsers.some(u => u.code && u.code.toLowerCase() === code.trim().toLowerCase());
      if (codeExists) {
        setError('Mã sinh viên này đã tồn tại!');
        setLoading(false);
        return;
      }

      // Format date format for dob (keep as YYYY-MM-DD or format to DD/MM/YYYY)
      // Since db.json createdAt is DD/MM/YYYY, let's store dob as YYYY-MM-DD (standard) or convert to DD/MM/YYYY
      const [year, month, day] = dob.split('-');
      const formattedDob = `${day}/${month}/${year}`;

      const today = new Date();
      const createdAt = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

      // Auto generate username from email prefix
      const username = email.split('@')[0];

      const newUserData = {
        username: username,
        password: password,
        fullName: fullName.trim(),
        email: email.trim(),
        role: 'student',
        clubId: null,
        isPresident: false,
        code: code.trim().toUpperCase(),
        dob: formattedDob,
        createdAt: createdAt
      };

      await authService.createUser(newUserData);
      setSuccess('Đăng ký tài khoản thành công! Bạn sẽ được chuyển hướng đến trang Đăng Nhập...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Lỗi khi đăng ký:', err);
      setError(err.message || 'Có lỗi xảy ra khi tạo tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 my-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-lg p-4">
            <Card.Body>
              <div className="text-center mb-4">
                <h3 className="fw-bold mt-2">Đăng Ký</h3>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formRegCode">
                      <Form.Label className="fw-semibold">Mã sinh viên <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="VD: HE170001"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formRegFullName">
                      <Form.Label className="fw-semibold">Họ và tên <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="VD: Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formRegDob">
                      <Form.Label className="fw-semibold">Ngày sinh <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formRegEmail">
                      <Form.Label className="fw-semibold">Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="VD: a@fpt.edu.vn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formRegPassword">
                      <Form.Label className="fw-semibold">Mật khẩu <span className="text-danger">*</span></Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <InputGroup.Text
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ cursor: 'pointer', backgroundColor: 'transparent' }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="formRegConfirmPassword">
                      <Form.Label className="fw-semibold">Xác nhận mật khẩu <span className="text-danger">*</span></Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <InputGroup.Text
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ cursor: 'pointer', backgroundColor: 'transparent' }}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-semibold rounded-pill"
                  disabled={loading}
                >
                  {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
                </Button>
              </Form>

              <div className="mt-3 text-center small">
                Đã có tài khoản? <span className="text-primary fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Đăng nhập</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
