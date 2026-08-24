import React, { useState } from 'react';
import { Card, Table, Alert, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FaEye, FaExternalLinkAlt } from 'react-icons/fa';
import { reportService } from '../../../services/api';

const PdpReports = ({ allReports = [], onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [pdpFeedback, setPdpFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleOpenDetail = (report) => {
    setSelectedReport(report);
    setPdpFeedback(report.pdpFeedback || '');
    setShowModal(true);
  };

  const handleAction = async (status) => {
    if (!selectedReport) return;
    try {
      setActionLoading(true);
      await reportService.update(selectedReport.id, {
        status,
        pdpFeedback: pdpFeedback.trim()
      });
      alert(`Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} báo cáo thành công!`);
      setShowModal(false);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái báo cáo:', err);
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4 text-dark">Danh sách Báo cáo Hậu Sự kiện</h5>
        
        {allReports.length === 0 ? (
          <Alert variant="info" className="mb-0 text-center py-4">
            Hiện tại chưa có báo cáo hậu sự kiện nào được nộp lên hệ thống.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tên Sự Kiện</th>
                  <th className="admin-table-header py-3 px-4">Câu Lạc Bộ</th>
                  <th className="admin-table-header py-3 px-4">Ngày nộp báo cáo</th>
                  <th className="admin-table-header py-3 px-4">Học kỳ</th>
                  <th className="admin-table-header py-3 px-4">Trạng thái</th>
                  <th className="admin-table-header py-3 px-4 text-end" style={{ borderRadius: '0 8px 0 0' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {allReports.map((report) => (
                  <tr key={report.id}>
                    <td className="fw-bold py-3 px-4" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.eventTitle}
                    </td>
                    <td className="py-3 px-4">{report.clubName}</td>
                    <td className="py-3 px-4 text-muted small">{formatDateStr(report.submittedAt)}</td>
                    <td className="py-3 px-4">
                      <Badge bg="light" className="text-dark border">
                        {report.term || 'N/A'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {report.status === 'pending' && (
                        <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Đang chờ duyệt</Badge>
                      )}
                      {report.status === 'approved' && (
                        <Badge bg="success" className="px-3 py-2 fw-medium rounded-pill">Đã duyệt</Badge>
                      )}
                      {report.status === 'rejected' && (
                        <Badge bg="danger" className="px-3 py-2 fw-medium rounded-pill">Bị từ chối</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="d-inline-flex align-items-center gap-1"
                        onClick={() => handleOpenDetail(report)}
                      >
                        <FaEye /> Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>

      {/* Modal Xem chi tiết và Duyệt báo cáo */}
      <Modal show={showModal} onHide={() => !actionLoading && setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton={!actionLoading}>
          <Modal.Title className="fw-bold fs-5">Chi tiết & Phê duyệt báo cáo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          {selectedReport && (
            <>
              <div className="mb-4 border-bottom pb-3">
                <h6 className="fw-bold text-dark mb-1">{selectedReport.eventTitle}</h6>
                <p className="text-muted small mb-0">
                  CLB Tổ chức: <strong>{selectedReport.clubName}</strong> | Học kỳ: <strong>{selectedReport.term}</strong>
                </p>
                <span className="text-muted small">
                  Ngày nộp: {new Date(selectedReport.submittedAt).toLocaleString('vi-VN')}
                </span>
              </div>

              <div className="mb-3">
                <div className="fw-semibold text-dark mb-1 small">Tóm tắt nội dung sự kiện:</div>
                <div className="bg-light p-3 rounded text-dark whitespace-pre-wrap small">
                  {selectedReport.summary}
                </div>
              </div>

              {selectedReport.notes && (
                <div className="mb-3">
                  <div className="fw-semibold text-dark mb-1 small">Ghi chú khác:</div>
                  <div className="bg-light p-3 rounded text-dark whitespace-pre-wrap small">
                    {selectedReport.notes}
                  </div>
                </div>
              )}

              <div className="mb-4 border-bottom pb-3">
                <div className="fw-semibold text-dark mb-1 small">Link minh chứng Drive ảnh chụp:</div>
                <div>
                  <a
                    href={selectedReport.evidenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="d-inline-flex align-items-center gap-1 fw-semibold text-decoration-none"
                  >
                    {selectedReport.evidenceLink} <FaExternalLinkAlt size={12} />
                  </a>
                </div>
              </div>

              {selectedReport.status === 'pending' ? (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-dark small">Nhận xét của PDP (nếu từ chối thì bắt buộc nhập lí do)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Nhập ý kiến đánh giá, góp ý hoặc lý do từ chối báo cáo..."
                    value={pdpFeedback}
                    onChange={(e) => setPdpFeedback(e.target.value)}
                    disabled={actionLoading}
                  />
                </Form.Group>
              ) : (
                selectedReport.pdpFeedback && (
                  <div className="p-3 bg-light rounded border">
                    <div className="fw-bold text-dark mb-1 small">Ý kiến phản hồi từ PDP:</div>
                    <p className="text-muted small mb-0">{selectedReport.pdpFeedback}</p>
                  </div>
                )
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="px-4 py-3">
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={actionLoading}>
            Đóng
          </Button>
          {selectedReport && selectedReport.status === 'pending' && (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  if (!pdpFeedback.trim()) {
                    alert('Vui lòng nhập lý do từ chối vào phần Nhận xét.');
                    return;
                  }
                  handleAction('rejected');
                }}
                disabled={actionLoading}
              >
                Từ chối
              </Button>
              <Button
                variant="success"
                onClick={() => handleAction('approved')}
                disabled={actionLoading}
              >
                Phê duyệt
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default PdpReports;
