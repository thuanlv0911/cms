import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin');
      } else if (currentUser.role === 'pdp') {
        navigate('/pdp');
      } else if (currentUser.role === 'student' && currentUser.isPresident) {
        navigate('/president');
      } else {
        navigate('/');
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else if (res.user.role === 'pdp') {
        navigate('/pdp');
      } else if (res.user.role === 'student' && res.user.isPresident) {
        navigate('/president');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <Container className="py-5 my-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="border-0 shadow-lg p-4">
            <Card.Body>
              <div className="text-center mb-4">
                <h3 className="fw-bold mt-2">Đăng Nhập</h3>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email (VD: student1@fpt.edu.vn)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="fw-semibold">Mật khẩu</Form.Label>
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

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-semibold rounded-pill"
                  disabled={loading}
                >
                  {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
                </Button>
              </Form>

              <div className="mt-3 text-center small">
                Chưa có tài khoản? <span className="text-primary fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/register')}>Đăng ký ngay</span>
              </div>

              <div className="mt-4 pt-3 border-top text-center text-muted small">
                <p className="mb-1"><strong>Tài khoản Demo gợi ý:</strong></p>
                <div className="text-start bg-light p-2 rounded">
                  <div>• Admin: <code>admin@fpt.edu.vn</code> / <code>123</code></div>
                  <div>• Phòng PDP: <code>pdp@fpt.edu.vn</code> / <code>123</code></div>
                  <div>• Chủ nhiệm: <code>president.bg@fpt.edu.vn</code> / <code>123</code></div>
                  <div>• Sinh viên: <code>student1@fpt.edu.vn</code> / <code>123</code></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
