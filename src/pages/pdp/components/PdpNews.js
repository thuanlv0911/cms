import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Badge, Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { newsService, semesterService } from '../../../services/api';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';

const PdpNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  const getNewsTerm = (n) => {
    if (n.term) return n.term;
    if (!n.createdAt || semesters.length === 0) return 'Không xác định';
    const date = new Date(n.createdAt);
    const matchedSem = semesters.find(sem => {
      const start = parseDateStr(sem.startDate);
      const end = parseDateStr(sem.endDate);
      return start && end && date >= start && date <= end;
    });
    return matchedSem ? matchedSem.name : 'Không xác định';
  };

  const fetchNewsAndSemesters = async () => {
    try {
      setLoading(true);
      setError('');
      const [newsData, semestersData] = await Promise.all([
        newsService.getAll(),
        semesterService.getAll()
      ]);
      setNewsList(newsData);
      setSemesters(semestersData);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu tin tức:', err);
      setError('Không thể tải danh sách tin tức từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsAndSemesters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateStr = (dateISO) => {
    if (!dateISO) return '';
    const date = new Date(dateISO);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success" className="px-3 py-2 fw-medium rounded-pill">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge bg="danger" className="px-3 py-2 fw-medium rounded-pill">Từ chối</Badge>;
      default:
        return <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Đang chờ duyệt</Badge>;
    }
  };

  const handleOpenDetailModal = (item) => {
    setSelectedNews(item);
    setRejectReason('');
    setShowRejectInput(false);
    setShowModal(true);
  };

  const handleApprove = async () => {
    if (!selectedNews) return;
    try {
      setActionLoading(true);
      await newsService.update(selectedNews.id, { 
        status: 'approved',
        pdpFeedback: 'Đã duyệt.' 
      });
      await fetchNewsAndSemesters();
      setShowModal(false);
    } catch (err) {
      console.error('Lỗi khi duyệt tin tức:', err);
      alert('Có lỗi xảy ra khi phê duyệt tin tức.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedNews) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối trước khi xác nhận!');
      return;
    }
    try {
      setActionLoading(true);
      await newsService.update(selectedNews.id, { 
        status: 'rejected',
        pdpFeedback: rejectReason.trim()
      });
      await fetchNewsAndSemesters();
      setShowModal(false);
    } catch (err) {
      console.error('Lỗi khi từ chối tin tức:', err);
      alert('Có lỗi xảy ra khi từ chối tin tức.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4 text-dark">Duyệt & Quản lý Tin tức</h5>
        
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-2 text-muted">Đang tải danh sách tin tức...</p>
          </div>
        ) : newsList.length === 0 ? (
          <Alert variant="info" className="mb-0 text-center">
            Hiện chưa có tin tức hay bài đăng nào được gửi lên từ các CLB.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tiêu đề tin tức</th>
                  <th className="admin-table-header py-3 px-4">Câu Lạc Bộ</th>
                  <th className="admin-table-header py-3 px-4">Ngày gửi</th>
                  <th className="admin-table-header py-3 px-4">Học kỳ</th>
                  <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0', width: '160px' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {newsList.map((n) => (
                  <tr key={n.id}>
                    <td className="fw-bold py-3 px-4">
                      <span 
                        className="text-primary text-decoration-underline cursor-pointer"
                        onClick={() => handleOpenDetailModal(n)}
                        style={{ cursor: 'pointer' }}
                      >
                        {n.title}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-dark fw-medium">{n.clubName}</td>
                    <td className="py-3 px-4 text-muted small">{formatDateStr(n.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Badge bg="light" className="text-dark border px-3 py-1.5 fw-medium">
                        {getNewsTerm(n)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(n.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Chi tiết & Phê duyệt Tin tức</Modal.Title>
        </Modal.Header>
        {selectedNews && (
          <Modal.Body className="px-4 py-3">
            <div className="mb-4">
              <span className="text-muted small d-block mb-1">Tiêu đề tin tức</span>
              <h4 className="fw-bold text-dark mb-0">{selectedNews.title}</h4>
            </div>

            <Row className="g-3 mb-4">
              <Col md={4}>
                <span className="text-muted small d-block">Câu lạc bộ</span>
                <span className="fw-semibold text-dark fs-6">{selectedNews.clubName}</span>
              </Col>
              <Col md={4}>
                <span className="text-muted small d-block">Ngày gửi bài</span>
                <span className="fw-semibold text-dark fs-6">{formatDateStr(selectedNews.createdAt)}</span>
              </Col>
              <Col md={4}>
                <span className="text-muted small d-block">Trạng thái duyệt</span>
                <div className="mt-1">
                  {getStatusBadge(selectedNews.status)}
                </div>
              </Col>
            </Row>

            {selectedNews.image && (
              <div className="mb-4">
                <span className="text-muted small d-block mb-2">Ảnh banner bài đăng</span>
                <div className="text-center bg-light p-2 rounded">
                  <img 
                    src={selectedNews.image} 
                    alt="Banner tin tức" 
                    className="img-fluid rounded" 
                    style={{ maxHeight: '240px', objectFit: 'cover' }} 
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <span className="text-muted small d-block mb-1">Nội dung tin tức</span>
              <div 
                className="p-3 bg-light rounded text-dark fs-6" 
                style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
              >
                {selectedNews.content}
              </div>
            </div>

            {selectedNews.pdpFeedback && (
              <div className="mb-4">
                <span className="text-muted small d-block mb-1">Phản hồi từ PDP hiện tại</span>
                <Alert variant={selectedNews.status === 'approved' ? 'success' : 'danger'} className="mb-0">
                  {selectedNews.pdpFeedback}
                </Alert>
              </div>
            )}

            {showRejectInput && (
              <Form.Group className="mb-4 bg-light p-3 rounded border border-danger-subtle">
                <Form.Label className="fw-bold text-danger d-flex align-items-center">
                  <FaExclamationCircle className="me-2" /> Nhập lý do từ chối xét duyệt:
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Ghi rõ lý do tại sao không phê duyệt bài tin này (thiếu thông tin, hình ảnh không phù hợp...)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="border-danger-subtle"
                />
              </Form.Group>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              {!showRejectInput ? (
                <>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowModal(false)}
                    className="rounded-pill px-4"
                    disabled={actionLoading}
                  >
                    Đóng
                  </Button>
                  
                  {selectedNews.status === 'pending' && (
                    <>
                      <Button 
                        variant="danger" 
                        onClick={() => setShowRejectInput(true)}
                        className="rounded-pill px-4 d-flex align-items-center gap-2"
                        disabled={actionLoading}
                      >
                        <FaTimesCircle /> Từ chối
                      </Button>
                      <Button 
                        variant="success" 
                        onClick={handleApprove}
                        className="rounded-pill px-4 d-flex align-items-center gap-2"
                        disabled={actionLoading}
                      >
                        <FaCheckCircle /> Phê duyệt
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      setShowRejectInput(false);
                      setRejectReason('');
                    }}
                    className="rounded-pill px-4"
                    disabled={actionLoading}
                  >
                    Hủy
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={handleReject}
                    className="rounded-pill px-4 d-flex align-items-center gap-2"
                    disabled={actionLoading}
                  >
                    <FaTimesCircle /> Xác nhận Từ chối
                  </Button>
                </>
              )}
            </div>
          </Modal.Body>
        )}
      </Modal>
    </Card>
  );
};

export default PdpNews;
