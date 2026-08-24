import React, { useState } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaEye, FaEdit, FaExternalLinkAlt } from 'react-icons/fa';
import { reportService, eventService } from '../../../services/api';

const ReportTab = ({ events = [], reports = [], clubInfo, currentUser, onRefresh }) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  // Form states
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Determine organizational status of an event
  const getEventOrgStatus = (event) => {
    if (event.status !== 'approved') {
      switch (event.status) {
        case 'pending':
          return { label: 'Chờ duyệt sự kiện', variant: 'warning', isEnded: false };
        case 'approved_to_defend':
          return { label: 'Được duyệt bảo vệ', variant: 'info', isEnded: false };
        case 'rejected':
          return { label: 'Sự kiện bị từ chối', variant: 'danger', isEnded: false };
        default:
          return { label: 'Không xác định', variant: 'secondary', isEnded: false };
      }
    }

    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate || event.startDate);

    if (now < start) {
      return { label: 'Sắp diễn ra', variant: 'info', isEnded: false };
    } else if (now >= start && now <= end) {
      return { label: 'Đang diễn ra', variant: 'warning', isEnded: false };
    } else {
      return { label: 'Đã tổ chức xong', variant: 'success', isEnded: true };
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const handleOpenCreateReport = (event, existingReport = null) => {
    setSelectedEvent(event);
    setSelectedReport(existingReport);
    
    if (existingReport) {
      setSummary(existingReport.summary || '');
      setNotes(existingReport.notes || '');
      setEvidenceLink(existingReport.evidenceLink || '');
    } else {
      setSummary('');
      setNotes('');
      setEvidenceLink('');
    }
    
    setError('');
    setShowFormModal(true);
  };

  const handleOpenViewReport = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setError('');

    if (!summary.trim()) {
      setError('Vui lòng điền tóm tắt nội dung sự kiện.');
      return;
    }
    if (!evidenceLink.trim()) {
      setError('Vui lòng điền link minh chứng Drive.');
      return;
    }

    try {
      setSubmitLoading(true);

      const payload = {
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        clubId: currentUser.clubId,
        clubName: clubInfo?.name || currentUser.clubName || selectedEvent.clubName || '',
        summary: summary.trim(),
        notes: notes.trim(),
        evidenceLink: evidenceLink.trim(),
        term: selectedEvent.term || ''
      };

      if (selectedReport) {
        // Update existing rejected report
        await reportService.update(selectedReport.id, {
          ...payload,
          status: 'pending',
          pdpFeedback: '',
          submittedAt: new Date().toISOString()
        });
      } else {
        // Create new report
        await reportService.create(payload);
        // Update hasReport of the event
        await eventService.update(selectedEvent.id, { hasReport: true });
      }

      alert('Đã nộp báo cáo hậu sự kiện thành công! Đang chờ phòng PDP duyệt.');
      setShowFormModal(false);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error('Lỗi khi nộp báo cáo:', err);
      setError(err.message || 'Có lỗi xảy ra khi nộp báo cáo.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-1 text-dark">Báo cáo hậu sự kiện</h5>
            <p className="text-muted small mb-0">
              Quản lý và nộp báo cáo nghiệm thu sự kiện sau khi đã tổ chức xong
            </p>
          </div>
        </div>

        {events.length === 0 ? (
          <Alert variant="info" className="text-center py-4">
            Câu lạc bộ của bạn chưa có sự kiện nào được tạo. Vui lòng tạo sự kiện trong tab "Quản lý Events" trước.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tên Sự Kiện</th>
                  <th className="admin-table-header py-3 px-4">Thời Gian Tổ Chức</th>
                  <th className="admin-table-header py-3 px-4">Trạng Thái Tổ Chức</th>
                  <th className="admin-table-header py-3 px-4">Trạng Thái Báo Cáo</th>
                  <th className="admin-table-header py-3 px-4 text-end" style={{ borderRadius: '0 8px 0 0' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const orgStatus = getEventOrgStatus(event);
                  const report = reports.find(r => r.eventId === event.id);
                  
                  let reportBadge = <Badge bg="secondary" className="px-3 py-2 fw-medium rounded-pill">Chưa báo cáo</Badge>;
                  if (report) {
                    if (report.status === 'pending') {
                      reportBadge = <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Đang chờ duyệt</Badge>;
                    } else if (report.status === 'approved') {
                      reportBadge = <Badge bg="success" className="px-3 py-2 fw-medium rounded-pill">Đã duyệt</Badge>;
                    } else if (report.status === 'rejected') {
                      reportBadge = <Badge bg="danger" className="px-3 py-2 fw-medium rounded-pill">Bị từ chối</Badge>;
                    }
                  }

                  return (
                    <tr key={event.id}>
                      <td className="fw-bold py-3 px-4" style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {event.title}
                      </td>
                      <td className="py-3 px-4 text-muted small">
                        {formatDateTime(event.startDate)} <br/>
                        đến {formatDateTime(event.endDate)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge bg={orgStatus.variant} className={`px-3 py-2 fw-medium rounded-pill ${orgStatus.variant === 'warning' ? 'text-dark' : ''}`}>
                          {orgStatus.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {orgStatus.isEnded ? reportBadge : <span className="text-muted small">-</span>}
                      </td>
                      <td className="py-3 px-4 text-end">
                        {orgStatus.isEnded ? (
                          <>
                            {(!report || report.status === 'rejected') && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="d-inline-flex align-items-center gap-1"
                                onClick={() => handleOpenCreateReport(event, report)}
                              >
                                {report ? <FaEdit /> : <FaPlus />} {report ? 'Nộp lại báo cáo' : 'Tạo báo cáo'}
                              </Button>
                            )}
                            {report && report.status !== 'rejected' && (
                              <Button
                                variant="outline-info"
                                size="sm"
                                className="d-inline-flex align-items-center gap-1"
                                onClick={() => handleOpenViewReport(report)}
                              >
                                <FaEye /> Xem báo cáo
                              </Button>
                            )}
                          </>
                        ) : (
                          <span className="text-muted small fs-7" title="Chỉ sự kiện đã tổ chức xong mới có thể làm báo cáo">
                            Chưa thể báo cáo
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      {/* Modal nộp báo cáo */}
      <Modal show={showFormModal} onHide={() => !submitLoading && setShowFormModal(false)} size="lg" centered>
        <Modal.Header closeButton={!submitLoading}>
          <Modal.Title className="fw-bold fs-5">
            {selectedReport ? 'Nộp lại báo cáo hậu sự kiện' : 'Tạo báo cáo hậu sự kiện'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitReport}>
          <Modal.Body className="px-4 py-3">
            {error && <Alert variant="danger">{error}</Alert>}
            
            {selectedReport && selectedReport.pdpFeedback && (
              <Alert variant="danger">
                <strong>Phản hồi từ PDP trước đó:</strong> {selectedReport.pdpFeedback}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-muted small">Tên sự kiện</Form.Label>
              <Form.Control type="text" value={selectedEvent?.title || ''} disabled className="bg-light border-0 fw-medium" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-dark small">Tóm tắt nội dung sự kiện <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Tóm tắt ngắn gọn các nội dung, diễn biến chính của sự kiện đã tổ chức..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                disabled={submitLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-dark small">Ghi chú / Các ý kiến khác (nếu có)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Ghi chú thêm về số lượng người tham gia, chi phí, hoặc các phát sinh khác..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-dark small">Link minh chứng ảnh chụp Drive <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="url"
                placeholder="Nhập link Google Drive chứa hình ảnh, video hoạt động của sự kiện..."
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
                required
                disabled={submitLoading}
              />
              <Form.Text className="text-muted small">
                Link Drive chứa ảnh chụp được của sự kiện khi tổ chức để PDP nghiệm thu.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="px-4 py-3 border-top-0">
            <Button variant="secondary" onClick={() => setShowFormModal(false)} disabled={submitLoading}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" disabled={submitLoading}>
              {submitLoading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal xem chi tiết báo cáo */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-5">Chi tiết báo cáo hậu sự kiện</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <div className="mb-4">
            <h6 className="fw-bold text-dark mb-1">{selectedReport?.eventTitle}</h6>
            <span className="text-muted small">
              Đơn vị tổ chức: {selectedReport?.clubName} | Học kỳ: {selectedReport?.term}
            </span>
          </div>

          <div className="mb-3 border-bottom pb-3">
            <div className="fw-semibold text-dark mb-1 small">Trạng thái báo cáo:</div>
            <div>
              {selectedReport?.status === 'pending' && (
                <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Đang chờ duyệt</Badge>
              )}
              {selectedReport?.status === 'approved' && (
                <Badge bg="success" className="px-3 py-2 fw-medium rounded-pill">Đã duyệt</Badge>
              )}
              {selectedReport?.status === 'rejected' && (
                <Badge bg="danger" className="px-3 py-2 fw-medium rounded-pill">Bị từ chối</Badge>
              )}
              <span className="text-muted small ms-2">
                (Nộp lúc: {selectedReport?.submittedAt ? new Date(selectedReport.submittedAt).toLocaleString('vi-VN') : ''})
              </span>
            </div>
          </div>

          <div className="mb-3">
            <div className="fw-semibold text-dark mb-1 small">Tóm tắt nội dung sự kiện:</div>
            <div className="bg-light p-3 rounded text-dark whitespace-pre-wrap small">
              {selectedReport?.summary}
            </div>
          </div>

          {selectedReport?.notes && (
            <div className="mb-3">
              <div className="fw-semibold text-dark mb-1 small">Ghi chú khác:</div>
              <div className="bg-light p-3 rounded text-dark whitespace-pre-wrap small">
                {selectedReport?.notes}
              </div>
            </div>
          )}

          <div className="mb-3 border-bottom pb-3">
            <div className="fw-semibold text-dark mb-1 small">Link minh chứng Drive ảnh chụp:</div>
            <div>
              <a href={selectedReport?.evidenceLink} target="_blank" rel="noopener noreferrer" className="d-inline-flex align-items-center gap-1 fw-medium text-decoration-none">
                {selectedReport?.evidenceLink} <FaExternalLinkAlt size={12} />
              </a>
            </div>
          </div>

          {selectedReport?.pdpFeedback && (
            <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded">
              <div className="fw-bold text-danger mb-1 small">Ý kiến phản hồi từ phòng PDP:</div>
              <p className="text-danger small mb-0">{selectedReport.pdpFeedback}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="px-4 py-3">
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ReportTab;
