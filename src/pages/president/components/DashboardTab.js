import React from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { FaUsers, FaCalendarAlt, FaNewspaper, FaBell } from 'react-icons/fa';

const DashboardTab = ({
  clubInfo,
  currentUser,
  activeSemesterName,
  membersCount,
  eventsCount,
  newsCount,
  notifications
}) => {
  const getStatusBadge = (notif) => {
    if (notif.type === 'Sự kiện') {
      switch (notif.status) {
        case 'approved':
          return (
            <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-medium rounded-pill fs-7">
              Đã duyệt tổng
            </Badge>
          );
        case 'approved_to_defend':
          return (
            <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-3 py-2 fw-medium rounded-pill fs-7">
              Duyệt bảo vệ
            </Badge>
          );
        case 'rejected_slot':
          return (
            <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-medium rounded-pill fs-7">
              Từ chối (Đổi lịch)
            </Badge>
          );
        case 'rejected_content':
          return (
            <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 fw-medium rounded-pill fs-7">
              Từ chối (Sửa nội dung)
            </Badge>
          );
        case 'rejected_final':
        case 'rejected':
          return (
            <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 fw-medium rounded-pill fs-7">
              Từ chối hoàn toàn
            </Badge>
          );
        default:
          return (
            <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-medium rounded-pill fs-7">
              Chờ duyệt bảo vệ
            </Badge>
          );
      }
    } else {
      switch (notif.status) {
        case 'approved':
          return (
            <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-medium rounded-pill fs-7">
              Đã duyệt
            </Badge>
          );
        case 'rejected':
          return (
            <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 fw-medium rounded-pill fs-7">
              Từ chối
            </Badge>
          );
        default:
          return (
            <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-medium rounded-pill fs-7">
              Chờ duyệt
            </Badge>
          );
      }
    }
  };

  const getFeedbackText = (notif) => {
    if (
      notif.status === 'rejected' ||
      notif.status === 'rejected_slot' ||
      notif.status === 'rejected_content' ||
      notif.status === 'rejected_final'
    ) {
      return <span className="text-danger fw-semibold">{notif.feedback}</span>;
    }
    return <span className="text-muted">-</span>;
  };

  return (
    <div>
      <div className="mb-4 bg-white p-4 rounded shadow-sm d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold text-dark mb-2">
            CLB: {clubInfo ? clubInfo.name : 'Đang tải...'}
          </h4>
          <div className="text-muted mb-0 d-flex flex-wrap gap-2 small align-items-center">
            <span><strong>Loại CLB:</strong> {clubInfo ? clubInfo.category : ''}</span>
            <span className="mx-1">|</span>
            <span><strong>Chủ nhiệm:</strong> {currentUser.fullName}</span>
            <span className="mx-1">|</span>
            <span><strong>Học kỳ hoạt động:</strong> <strong className="text-orange">{activeSemesterName || 'Học kỳ ngoài'}</strong></span>
          </div>
        </div>
      </div>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-card-icon bg-light-blue text-blue me-3">
                <FaUsers size={22} />
              </div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Thành viên CLB</div>
                <h3 className="fw-bold mb-0 mt-1">{membersCount}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-card-icon bg-light-green text-green me-3">
                <FaCalendarAlt size={22} />
              </div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Sự kiện trong kỳ</div>
                <h3 className="fw-bold mb-0 mt-1">{eventsCount}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-card-icon bg-light-yellow text-yellow me-3">
                <FaNewspaper size={20} />
              </div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Tin tức trong kỳ</div>
                <h3 className="fw-bold mb-0 mt-1">{newsCount}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-4 text-dark d-flex align-items-center">
            <FaBell className="text-orange me-2" /> Hòm thư phản hồi & Thông báo từ PDP
          </h5>
          {notifications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              Hiện chưa có phản hồi hoặc thông báo xét duyệt nào từ cán bộ PDP.
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0', width: '120px' }}>Loại</th>
                    <th className="admin-table-header py-3 px-4">Tên yêu cầu</th>
                    <th className="admin-table-header py-3 px-4" style={{ width: '180px' }}>Trạng thái</th>
                    <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0' }}>Phản hồi từ PDP</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notif) => (
                    <tr key={notif.id}>
                      <td className="py-3 px-4">
                        <Badge bg={notif.type === 'Sự kiện' ? 'primary' : 'info'} className="px-2 py-1.5 fw-medium text-capitalize">
                          {notif.type}
                        </Badge>
                      </td>
                      <td className="fw-bold py-3 px-4">{notif.title}</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(notif)}
                      </td>
                      <td className="py-3 px-4 text-secondary">
                        {getFeedbackText(notif)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DashboardTab;
