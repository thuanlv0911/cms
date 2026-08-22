import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Alert, Badge, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { authService, clubService } from '../../services/api';
import {
  FaTachometerAlt,
  FaUsers,
  FaSignOutAlt,
  FaUserCircle,
  FaPlus,
  FaUserShield,
  FaUserGraduate,
  FaUserPlus
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'admin') {
      navigate('/unauthorized');
    }
  }, [currentUser, navigate]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersData, clubsData] = await Promise.all([
        authService.getAllUsers(),
        clubService.getAll()
      ]);
      setUsers(usersData);
      setClubs(clubsData);
    } catch (err) {
      console.error('Lỗi khi tải danh sách dữ liệu:', err);
      setError('Không thể tải dữ liệu từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const getClubName = (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Chưa tham gia';
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddPDP = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!username.trim() || !password.trim() || !fullName.trim() || !email.trim() || !code.trim()) {
      setModalError('Vui lòng nhập đầy đủ tất cả các trường!');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setModalError('Tên đăng nhập đã tồn tại!');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setModalError('Email đã được sử dụng!');
      return;
    }

    if (users.some(u => u.code && u.code.toLowerCase() === code.trim().toLowerCase())) {
      setModalError('Mã nhân viên đã tồn tại!');
      return;
    }

    try {
      const today = new Date();
      const createdAt = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

      const newUserData = {
        username: username.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        role: 'pdp',
        clubId: null,
        isPresident: false,
        code: code.trim(),
        status: 'Đang hoạt động',
        createdAt: createdAt
      };

      await authService.createUser(newUserData);

      setModalSuccess('Thêm nhân viên PDP thành công!');
      setUsername('');
      setPassword('');
      setFullName('');
      setEmail('');
      setCode('');

      await fetchUsers();

      setTimeout(() => {
        setShowAddModal(false);
        setModalSuccess('');
      }, 1500);

    } catch (err) {
      console.error('Lỗi khi tạo cán bộ PDP:', err);
      setModalError(err.message || 'Có lỗi xảy ra khi tạo tài khoản.');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }
  const pdpStaffCount = users.filter(u => u.role === 'pdp').length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const totalAccounts = pdpStaffCount + studentCount;

  const displayedUsers = activeTab === 'dashboard'
    ? users.filter(u => u.role === 'pdp')
    : users.filter(u => u.role === 'student');

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedUsers.length / itemsPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="admin-sidebar shadow-sm">
        <div>
          <div className="admin-sidebar-brand d-flex flex-column align-items-center text-center pt-4">
            <img src="/images/logo_FPTU.svg" alt="Logo FPTU" height="40" className="mb-3" />
          </div>

          <div className="p-3">
            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              <FaTachometerAlt className="me-3" size={18} />
              <span>Dashboard Admin</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => handleTabChange('students')}
            >
              <FaUsers className="me-3" size={18} />
              <span>Quản lý Sinh viên</span>
            </div>
          </div>
        </div>

        <div className="admin-profile-section d-flex align-items-center justify-content-between p-3">
          <div className="d-flex align-items-center overflow-hidden">
            <FaUserCircle size={35} className="text-secondary me-2 flex-shrink-0" />
            <div className="text-truncate" style={{ maxWidth: '140px' }}>
              <div className="fw-semibold text-dark small text-truncate">{currentUser.fullName}</div>
            </div>
          </div>
          <Button
            variant="link"
            className="text-danger p-0 d-flex align-items-center"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <FaSignOutAlt size={20} />
          </Button>
        </div>
      </div>

      <div className="flex-grow-1 p-4 overflow-auto">
        <div className="d-flex align-items-center mb-4 pb-2">
          <div className="dashboard-icon-wrapper me-3">
            <FaTachometerAlt size={22} />
          </div>
          <div>
            <h2 className="fw-bold mb-1 text-dark">Dashboard Admin</h2>
            <div className="text-muted small">Khu vực quản trị hệ thống và quản lý tài khoản cán bộ</div>
          </div>
        </div>

        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm p-3">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-card-icon bg-light-blue text-blue me-3">
                  <FaUsers size={22} />
                </div>
                <div>
                  <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Tổng số tài khoản</div>
                  <h3 className="fw-bold mb-0 mt-1">{loading ? '...' : totalAccounts}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm p-3">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-card-icon bg-light-green text-green me-3">
                  <FaUserShield size={20} />
                </div>
                <div>
                  <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Cán bộ Phòng PDP</div>
                  <h3 className="fw-bold mb-0 mt-1">{loading ? '...' : pdpStaffCount}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm p-3">
              <Card.Body className="d-flex align-items-center">
                <div className="stat-card-icon bg-light-yellow text-yellow me-3">
                  <FaUserGraduate size={20} />
                </div>
                <div>
                  <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Tài khoản sinh viên</div>
                  <h3 className="fw-bold mb-0 mt-1">{loading ? '...' : studentCount}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <FaUsers size={20} className="text-secondary me-2" />
                  <h5 className="fw-bold mb-0 text-dark">
                    {activeTab === 'dashboard' ? 'Danh sách cán bộ PDP Staff' : 'Danh sách tài khoản sinh viên'}
                  </h5>
                </div>

                {activeTab === 'dashboard' && (
                  <Button
                    variant="primary"
                    className="fw-semibold px-3 py-2 d-flex align-items-center btn-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    <FaPlus className="me-2" size={14} /> Thêm nhân viên PDP
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                </div>
              ) : displayedUsers.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  Không tìm thấy tài khoản nào.
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-4">
                      <thead>
                        <tr>
                          <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>
                            {activeTab === 'dashboard' ? 'Mã nhân viên' : 'Mã sinh viên'}
                          </th>
                          <th className="admin-table-header py-3 px-4">Họ và tên</th>
                          <th className="admin-table-header py-3 px-4">Email</th>
                          <th className="admin-table-header py-3 px-4">
                            {activeTab === 'dashboard' ? 'Trạng thái' : 'Chức vụ'}
                          </th>
                          <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0' }}>
                            {activeTab === 'dashboard' ? 'Ngày tạo' : 'CLB tham gia'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((u) => (
                          <tr key={u.id}>
                            <td className="fw-bold py-3 px-4">{u.code || u.username.toUpperCase()}</td>
                            <td className="py-3 px-4">{u.fullName}</td>
                            <td className="text-muted py-3 px-4">{u.email}</td>
                            <td className="py-3 px-4">
                              {activeTab === 'dashboard' ? (
                                <Badge
                                  bg="success-subtle"
                                  className="text-success border border-success-subtle px-3 py-2 fw-medium rounded-pill fs-7"
                                >
                                  {u.status || 'Đang hoạt động'}
                                </Badge>
                              ) : (
                                <Badge
                                  bg={u.isPresident ? "primary-subtle" : "secondary-subtle"}
                                  className={`${u.isPresident ? "text-primary border-primary-subtle" : "text-secondary border-secondary-subtle"} border px-3 py-2 fw-medium rounded-pill fs-7`}
                                >
                                  {u.isPresident ? 'Chủ nhiệm' : 'Sinh viên'}
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {activeTab === 'dashboard' ? (
                                <span className="text-muted">{u.createdAt || '12/10/2024'}</span>
                              ) : (
                                <span className={u.clubId ? "fw-medium text-dark" : "text-muted"}>
                                  {u.clubId ? getClubName(u.clubId) : 'Chưa tham gia'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-end">
                      <Pagination className="mb-0">
                        <Pagination.Prev
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        />
                        {Array.from({ length: totalPages }, (_, i) => (
                          <Pagination.Item
                            key={i + 1}
                            active={currentPage === i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        )}
      </div>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold d-flex align-items-center">
            <FaUserPlus className="me-2 text-primary" /> Thêm nhân viên PDP mới
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddPDP}>
          <Modal.Body>
            {modalError && <Alert variant="danger">{modalError}</Alert>}
            {modalSuccess && <Alert variant="success">{modalSuccess}</Alert>}

            <Form.Group className="mb-3" controlId="formPDPCode">
              <Form.Label className="fw-semibold">Mã nhân viên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập mã nhân viên (VD: USR004, PDP001...)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPDPUsername">
              <Form.Label className="fw-semibold">Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPDPPassword">
              <Form.Label className="fw-semibold">Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPDPFullName">
              <Form.Label className="fw-semibold">Họ và tên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập họ và tên nhân viên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPDPEmail">
              <Form.Label className="fw-semibold">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="pdp.employee@fpt.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="rounded-pill px-4">
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 btn-primary">
              Lưu tài khoản
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
