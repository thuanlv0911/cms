import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin/accounts');
      } else if (res.user.role === 'pdp') {
        navigate('/pdp/requests');
      } else if (res.user.role === 'student' && res.user.isPresident) {
        navigate('/president/events');
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
                <span className="fs-1">🍊</span>
                <h3 className="fw-bold mt-2">Đăng Nhập Hệ Thống</h3>
                <p className="text-muted small">Cổng thông tin quản lý Câu lạc bộ FPTU</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label className="fw-semibold">Tên đăng nhập</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Nhập tên đăng nhập (VD: admin, pdp, president1...)" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="fw-semibold">Mật khẩu</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Nhập mật khẩu" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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
              
              <div className="mt-4 pt-3 border-top text-center text-muted small">
                <p className="mb-1"><strong>Tài khoản Demo gợi ý:</strong></p>
                <div className="text-start bg-light p-2 rounded">
                  <div>• Admin: <code>admin</code> / <code>123</code></div>
                  <div>• Phòng PDP: <code>pdp</code> / <code>123</code></div>
                  <div>• Chủ nhiệm: <code>president1</code> / <code>123</code></div>
                  <div>• Sinh viên: <code>student1</code> / <code>123</code></div>
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
