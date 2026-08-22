import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Table, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaNewspaper,
  FaBell,
  FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';

const PresidentDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'student' || !currentUser.isPresident) {
      navigate('/unauthorized');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser || currentUser.role !== 'student' || !currentUser.isPresident) {
    return null;
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Chủ nhiệm';
      case 'clubs':
        return 'Quản lý Câu Lạc Bộ';
      case 'events':
        return 'Quản lý Events';
      case 'news':
        return 'Quản lý Tin tức';
      case 'notifications':
        return 'Thông báo';
      default:
        return 'Dashboard Chủ nhiệm';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tổng quan hoạt động CLB và lối tắt quản lý nhanh';
      case 'clubs':
        return 'Quản lý thông tin thành viên và hoạt động của câu lạc bộ';
      case 'events':
        return 'Tạo mới, chỉnh sửa và theo dõi trạng thái phê duyệt sự kiện';
      case 'news':
        return 'Đăng tin tức, bài viết truyền thông quảng bá hoạt động CLB';
      case 'notifications':
        return 'Xem thông báo từ phòng PDP và gửi thông báo tới thành viên';
      default:
        return 'Khu vực quản lý dành cho Chủ nhiệm CLB';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <div className="mb-4 bg-white p-4 rounded shadow-sm">
              <h4 className="fw-bold text-dark">Xin chào, {currentUser.fullName}! 👋</h4>
              <p className="text-muted mb-0">Chào mừng bạn quay trở lại trang quản trị hoạt động của câu lạc bộ.</p>
            </div>

            <Row className="g-4 mb-4">
              <Col md={3}>
                <Card className="border-0 shadow-sm p-3 h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-card-icon bg-light-blue text-blue me-3">
                      <FaUsers size={22} />
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Thành viên</div>
                      <h3 className="fw-bold mb-0 mt-1">45</h3>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm p-3 h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-card-icon bg-light-green text-green me-3">
                      <FaCalendarAlt size={22} />
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Sự kiện trong kỳ</div>
                      <h3 className="fw-bold mb-0 mt-1">4</h3>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm p-3 h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-card-icon bg-light-yellow text-yellow me-3">
                      <FaNewspaper size={20} />
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Bài viết tin tức</div>
                      <h3 className="fw-bold mb-0 mt-1">8</h3>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm p-3 h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-card-icon bg-light-orange text-orange me-3">
                      <FaBell size={20} />
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Thông báo mới</div>
                      <h3 className="fw-bold mb-0 mt-1">2</h3>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 text-dark">Lịch sử sự kiện gần đây</h5>
                <Table hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tên Sự Kiện</th>
                      <th className="admin-table-header py-3 px-4">Ngày tổ chức</th>
                      <th className="admin-table-header py-3 px-4">Loại sự kiện</th>
                      <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0' }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-bold py-3 px-4">Đêm Trải Nghiệm Cờ Tỷ Phú - Monopoly Night</td>
                      <td className="py-3 px-4">10/09/2026</td>
                      <td className="py-3 px-4">Nội bộ</td>
                      <td className="py-3 px-4">
                        <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Đang chờ duyệt</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold py-3 px-4">Giải đấu Ma Sói Mùa Thu 2026</td>
                      <td className="py-3 px-4">01/09/2026</td>
                      <td className="py-3 px-4">Công khai</td>
                      <td className="py-3 px-4">
                        <Badge bg="success" className="px-3 py-2 fw-medium rounded-pill">Đã duyệt</Badge>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>
        );

      case 'clubs':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3 text-dark">Quản lý Câu Lạc Bộ</h5>
              <Alert variant="info" className="mb-0">
                <strong>Thông báo:</strong> Chức năng quản lý chi tiết thông tin CLB và danh sách thành viên dành cho Chủ nhiệm đang được chuẩn bị xây dựng. Nội dung cụ thể sẽ được cập nhật sau.
              </Alert>
            </Card.Body>
          </Card>
        );

      case 'events':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3 text-dark">Quản lý Events</h5>
              <Alert variant="info" className="mb-0">
                <strong>Thông báo:</strong> Chức năng lập kế hoạch sự kiện, gửi yêu cầu xét duyệt tới phòng PDP dành cho Chủ nhiệm đang được chuẩn bị xây dựng. Nội dung cụ thể sẽ được cập nhật sau.
              </Alert>
            </Card.Body>
          </Card>
        );

      case 'news':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3 text-dark">Quản lý Tin tức</h5>
              <Alert variant="info" className="mb-0">
                <strong>Thông báo:</strong> Chức năng soạn thảo bài viết truyền thông, cập nhật tin tức câu lạc bộ dành cho Chủ nhiệm đang được chuẩn bị xây dựng. Nội dung cụ thể sẽ được cập nhật sau.
              </Alert>
            </Card.Body>
          </Card>
        );

      case 'notifications':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3 text-dark">Thông báo</h5>
              <Alert variant="info" className="mb-0">
                <strong>Thông báo:</strong> Hộp thư nhận thông báo từ phòng PDP và gửi thông báo chung cho các thành viên trong CLB dành cho Chủ nhiệm đang được chuẩn bị xây dựng. Nội dung cụ thể sẽ được cập nhật sau.
              </Alert>
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <div className="admin-sidebar shadow-sm">
        <div>
          <div
            className="admin-sidebar-brand d-flex flex-column align-items-center text-center pt-4"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
            title="Quay lại trang chủ"
          >
            <img src="/images/logo_FPTU.svg" alt="Logo FPTU" height="40" className="mb-3" />
          </div>

          <div className="p-3">
            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaTachometerAlt className="me-3" size={18} />
              <span>Dashboard</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'clubs' ? 'active' : ''}`}
              onClick={() => setActiveTab('clubs')}
            >
              <FaUsers className="me-3" size={18} />
              <span>Quản lý CLB</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <FaCalendarAlt className="me-3" size={18} />
              <span>Quản lý events</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              <FaNewspaper className="me-3" size={18} />
              <span>Quản lý tin tức</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <FaBell className="me-3" size={18} />
              <span>Thông báo</span>
            </div>
          </div>
        </div>

        <div className="admin-profile-section d-flex align-items-center justify-content-between p-3">
          <div className="d-flex align-items-center overflow-hidden">
            <FaUserCircle size={35} className="text-secondary me-2 flex-shrink-0" />
            <div className="text-truncate" style={{ maxWidth: '140px' }}>
              <div className="fw-semibold text-dark small text-truncate">Chủ nhiệm</div>
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
            {activeTab === 'dashboard' && <FaTachometerAlt size={22} />}
            {activeTab === 'clubs' && <FaUsers size={22} />}
            {activeTab === 'events' && <FaCalendarAlt size={22} />}
            {activeTab === 'news' && <FaNewspaper size={22} />}
            {activeTab === 'notifications' && <FaBell size={22} />}
          </div>
          <div>
            <h2 className="fw-bold mb-1 text-dark">{getTabTitle()}</h2>
            <div className="text-muted small">{getTabDescription()}</div>
          </div>
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
};

export default PresidentDashboard;
