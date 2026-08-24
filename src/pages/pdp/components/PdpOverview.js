import React, { useState } from 'react';
import { Row, Col, Card, Table, Badge, Pagination } from 'react-bootstrap';
import { FaUsers, FaCalendarCheck, FaNewspaper, FaBell } from 'react-icons/fa';

const PdpOverview = ({
  clubs = [],
  allEvents = [],
  allNews = [],
  allReports = [],
  allUsers = [],
  activeSemName = '',
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const getClubCategoryBadge = (category) => {
    switch (category) {
      case 'Học thuật':
        return <Badge bg="primary" className="px-3 py-2 fw-medium rounded-pill">Học thuật</Badge>;
      case 'Nghệ thuật':
        return <Badge bg="danger" className="px-3 py-2 fw-medium rounded-pill">Nghệ thuật</Badge>;
      case 'Thể thao':
        return <Badge bg="success" className="px-3 py-2 fw-medium rounded-pill">Thể thao</Badge>;
      case 'Lĩnh vực khác':
        return <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Lĩnh vực khác</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2 fw-medium rounded-pill">{category}</Badge>;
    }
  };

  const semesterEventsCount = allEvents.filter(e => (!e.term || e.term === activeSemName) && e.status === 'approved').length;
  const semesterNewsCount = allNews.filter(n => (!n.term || n.term === activeSemName) && n.status === 'approved').length;
  
  const pendingEventsCount = allEvents.filter(e => e.status === 'pending' || e.status === 'approved_to_defend').length;
  const pendingNewsCount = allNews.filter(n => n.status === 'pending').length;
  const pendingReportsCount = allReports.filter(r => r.status === 'pending').length;
  const totalPendingRequests = pendingEventsCount + pendingNewsCount + pendingReportsCount;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-2 text-muted">Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  const totalItems = clubs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClubs = clubs.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item 
        key={number} 
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div>
      <div className="mb-4 bg-white p-3 rounded shadow-sm d-flex align-items-center">
        <span className="fw-bold text-dark me-2 fs-6">Kỳ hoạt động:</span>
        <span className="text-orange fw-bold fs-6">{activeSemName || 'Chưa xác định'}</span>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-card-icon bg-light-blue text-blue me-3">
                <FaUsers size={22} />
              </div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Số lượng CLB</div>
                <h3 className="fw-bold mb-0 mt-1">{clubs.length}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-card-icon bg-light-green text-green me-3">
                <FaCalendarCheck size={22} />
              </div>
              <div>
                <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Sự kiện trong kỳ</div>
                <h3 className="fw-bold mb-0 mt-1">{semesterEventsCount}</h3>
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
                <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Tin tức trong kỳ</div>
                <h3 className="fw-bold mb-0 mt-1">{semesterNewsCount}</h3>
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
                <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Chờ phê duyệt</div>
                <h3 className="fw-bold mb-0 mt-1">{totalPendingRequests}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <h5 className="fw-bold mb-4 text-dark">Danh sách Câu Lạc Bộ</h5>
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tên Câu Lạc Bộ</th>
                  <th className="admin-table-header py-3 px-4">Loại Câu Lạc Bộ</th>
                  <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0', width: '220px' }}>Số lượng thành viên</th>
                </tr>
              </thead>
              <tbody>
                {currentClubs.map((club) => {
                  const memberCount = allUsers.filter(u => u.clubId === club.id).length;
                  return (
                    <tr key={club.id}>
                      <td className="fw-bold py-3 px-4">{club.name}</td>
                      <td className="py-3 px-4">
                        {getClubCategoryBadge(club.category)}
                      </td>
                      <td className="py-3 px-4 fw-semibold text-muted">
                        {memberCount} thành viên
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination className="mb-0">
                <Pagination.Prev 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                />
                {paginationItems}
                <Pagination.Next 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PdpOverview;
