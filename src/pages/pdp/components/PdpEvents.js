import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Badge, Modal, Button, Row, Col, Form } from 'react-bootstrap';
import { FaLock, FaChevronLeft, FaChevronRight, FaExclamationCircle } from 'react-icons/fa';
import { eventService } from '../../../services/api';

const PdpEvents = ({ fetchDashboardData }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentDate, setCurrentDate] = useState(new Date('2026-08-24'));
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectType, setRejectType] = useState('rejected_slot');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      setEvents(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách sự kiện:', err);
      setError('Không thể tải danh sách sự kiện từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getWeekDates = (date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentDate);
  const monday = weekDates[0];
  const friday = weekDates[4];

  const formatDateStr = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateShort = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const formatToInputDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const getWeekSelectorText = () => {
    return `Tuần: ${formatDateStr(monday)} - ${formatDateStr(friday)}`;
  };

  const slotsDef = [
    { slotNum: 1, timeRange: '08:00 - 10:00' },
    { slotNum: 2, timeRange: '13:00 - 15:00' },
    { slotNum: 3, timeRange: '15:30 - 17:30' },
    { slotNum: 4, timeRange: '18:00 - 20:00' }
  ];

  const handleOpenDetailModal = (event) => {
    setSelectedEvent(event);
    setRejectReason('');
    setRejectType('rejected_slot');
    setShowRejectInput(false);
    setShowModal(true);
  };

  const handleUpdateStatus = async (status, feedbackText = '') => {
    if (!selectedEvent) return;
    try {
      setActionLoading(true);
      const updatePayload = { status };
      if (status === 'rejected') {
        updatePayload.pdpFeedback = feedbackText;
      } else {
        updatePayload.pdpFeedback = 'Đã duyệt.';
      }
      await eventService.update(selectedEvent.id, updatePayload);
      await fetchEvents();
      if (fetchDashboardData) {
        await fetchDashboardData();
      }
      setShowModal(false);
    } catch (err) {
      console.error('Lỗi khi phê duyệt sự kiện:', err);
      alert(err.message || 'Có lỗi xảy ra khi cập nhật trạng thái sự kiện.');
    } finally {
      setActionLoading(false);
    }
  };



  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success" className="px-3 py-2 fw-medium rounded-pill">Đã duyệt tổng</Badge>;
      case 'approved_to_defend':
        return <Badge bg="primary" className="px-3 py-2 fw-medium rounded-pill">Duyệt bảo vệ</Badge>;
      case 'rejected_slot':
        return <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Từ chối (Đổi lịch)</Badge>;
      case 'rejected_content':
        return <Badge bg="danger" className="px-3 py-2 fw-medium rounded-pill">Từ chối (Sửa nội dung)</Badge>;
      case 'rejected_final':
        return <Badge bg="dark" className="px-3 py-2 fw-medium rounded-pill">Từ chối hoàn toàn</Badge>;
      case 'rejected':
        return <Badge bg="danger" className="px-3 py-2 fw-medium rounded-pill">Từ chối</Badge>;
      default:
        return <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Chờ duyệt bảo vệ</Badge>;
    }
  };

  const getStatusTextShort = (status) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt tổng';
      case 'approved_to_defend':
        return 'Duyệt bảo vệ';
      case 'rejected_slot':
        return 'Từ chối (Đổi lịch)';
      case 'rejected_content':
        return 'Từ chối (Sửa nội dung)';
      case 'rejected_final':
        return 'Từ chối hoàn toàn';
      case 'rejected':
        return 'Từ chối';
      default:
        return 'Chờ duyệt bảo vệ';
    }
  };

  const getCompactStatusBadge = (status) => {
    let bg = '#fff0d4';
    let color = '#b26a00';
    if (status === 'approved') {
      bg = '#e6f4ea';
      color = '#137333';
    } else if (status === 'approved_to_defend') {
      bg = '#e8f0fe';
      color = '#1a73e8';
    } else if (status === 'rejected_slot') {
      bg = '#fff3cd';
      color = '#856404';
    } else if (status === 'rejected_content') {
      bg = '#f8d7da';
      color = '#721c24';
    } else if (status === 'rejected_final' || status === 'rejected') {
      bg = '#e2e3e5';
      color = '#383d41';
    }
    return (
      <span 
        className="px-2 py-1 rounded fw-semibold d-inline-block text-truncate" 
        style={{ 
          backgroundColor: bg, 
          color: color, 
          fontSize: '11px',
          maxWidth: '100%'
        }}
      >
        {getStatusTextShort(status)}
      </span>
    );
  };

  return (
    <div>
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <div className="d-flex align-items-center gap-2">
              <Button variant="outline-secondary" size="sm" onClick={handlePrevWeek} className="rounded-pill px-3">
                <FaChevronLeft size={10} className="me-1" /> Tuần trước
              </Button>
              <span className="fw-bold text-dark fs-6 mx-2">{getWeekSelectorText()}</span>
              <Button variant="outline-secondary" size="sm" onClick={handleNextWeek} className="rounded-pill px-3">
                Tuần sau <FaChevronRight size={10} className="ms-1" />
              </Button>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Chọn tuần khác:</span>
              <Form.Control 
                type="date" 
                value={formatToInputDate(currentDate)} 
                onChange={(e) => setCurrentDate(new Date(e.target.value))} 
                className="d-inline-block w-auto rounded-pill border-secondary-subtle px-3"
              />
            </div>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2 text-muted">Đang tải lịch trình slots...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered className="align-middle text-center mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0', borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr className="bg-light">
                    <th className="admin-table-header py-3 px-3" style={{ width: '15%', backgroundColor: '#f8f9fa', color: '#333', fontSize: '13px' }}>Khung giờ / Slot</th>
                    <th className="admin-table-header py-3 px-3" style={{ width: '17%', backgroundColor: '#f8f9fa', color: '#333', fontSize: '13px' }}>Thứ Hai ({formatDateShort(weekDates[0])})</th>
                    <th className="admin-table-header py-3 px-3" style={{ width: '17%', backgroundColor: '#f8f9fa', color: '#333', fontSize: '13px' }}>Thứ Ba ({formatDateShort(weekDates[1])})</th>
                    <th className="admin-table-header py-3 px-3" style={{ width: '17%', backgroundColor: '#f8f9fa', color: '#333', fontSize: '13px' }}>Thứ Tư ({formatDateShort(weekDates[2])})</th>
                    <th className="admin-table-header py-3 px-3" style={{ width: '17%', backgroundColor: '#f8f9fa', color: '#333', fontSize: '13px' }}>Thứ Năm ({formatDateShort(weekDates[3])})</th>
                    <th className="admin-table-header py-3 px-3" style={{ width: '17%', backgroundColor: '#f8f9fa', color: '#333', fontSize: '13px' }}>Thứ Sáu ({formatDateShort(weekDates[4])})</th>
                  </tr>
                </thead>
                <tbody>
                  {slotsDef.map((slot) => (
                    <tr key={slot.slotNum}>
                      <td className="p-3 fw-bold bg-light text-start" style={{ borderRight: '1px solid #dee2e6' }}>
                        <div className="text-primary fw-bold" style={{ fontSize: '13px' }}>Slot {slot.slotNum}</div>
                        <div className="text-muted fw-normal" style={{ fontSize: '11px' }}>{slot.timeRange}</div>
                      </td>
                      {weekDates.map((date) => {
                        const dateStr = formatDateStr(date);
                        const matchedEvent = events.find(
                          (e) => e.defenseSlot && e.defenseSlot.dateStr === dateStr && e.defenseSlot.slot === slot.slotNum
                        );

                        return (
                          <td key={dateStr} className="p-2 align-top text-start" style={{ height: '170px', minWidth: '160px' }}>
                            {matchedEvent ? (
                              <div className="h-100 d-flex flex-column justify-content-between">
                                <div>
                                  <div 
                                    className="py-2 px-3 rounded text-center fw-bold mb-2" 
                                    style={{ 
                                      backgroundColor: '#e6f4ea', 
                                      border: '1px solid #00a389', 
                                      color: '#00a389', 
                                      fontSize: '12px',
                                      cursor: 'default'
                                    }}
                                  >
                                    Đã đặt
                                  </div>
                                  <div 
                                    className="fw-bold text-primary mb-1 text-decoration-underline text-truncate" 
                                    style={{ cursor: 'pointer', fontSize: '12px', lineHeight: '1.2' }}
                                    onClick={() => handleOpenDetailModal(matchedEvent)}
                                  >
                                    {matchedEvent.title}
                                  </div>
                                  <div className="mb-1">
                                    <span 
                                      className="px-2 py-0.5 rounded fw-medium d-inline-block text-secondary text-truncate" 
                                      style={{ backgroundColor: '#f1f3f4', fontSize: '10px', maxWidth: '100%' }}
                                    >
                                      {matchedEvent.clubName}
                                    </span>
                                  </div>
                                  
                                  <div>
                                    {getCompactStatusBadge(matchedEvent.status)}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-100 d-flex flex-column justify-content-center align-items-center gap-2">
                                <div 
                                  className="py-2 px-3 rounded text-center fw-bold w-100" 
                                  style={{ 
                                    backgroundColor: '#f0f8ff', 
                                    border: '1px solid #007aff', 
                                    color: '#007aff', 
                                    fontSize: '12px',
                                    cursor: 'default'
                                  }}
                                >
                                  Trống
                                </div>
                                <div 
                                  className="py-2 px-3 rounded text-center fw-bold w-100" 
                                  style={{ 
                                    border: '1px dashed #f5c6cb', 
                                    color: '#721c24', 
                                    fontSize: '12px',
                                    cursor: 'default'
                                  }}
                                >
                                  <FaLock className="me-1" size={10} /> Khóa slot
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            Chi tiết & Phê duyệt Sự kiện
          </Modal.Title>
        </Modal.Header>
        {selectedEvent && (
          <Modal.Body className="px-4 py-3">
            <div className="mb-4">
              <span className="text-muted small d-block">Tên sự kiện</span>
              <h4 className="fw-bold text-dark mb-0">{selectedEvent.title}</h4>
            </div>

            <Row className="g-3 mb-4">
              <Col md={6}>
                <span className="text-muted small d-block">Câu lạc bộ</span>
                <span className="fw-semibold text-dark fs-6">{selectedEvent.clubName}</span>
              </Col>
              <Col md={6}>
                <span className="text-muted small d-block">Số lượng tối đa</span>
                <span className="fw-semibold text-dark fs-6">{selectedEvent.expectedParticipants || 50} người</span>
              </Col>
              <Col md={6}>
                <span className="text-muted small d-block">Lịch bảo vệ đề án</span>
                <span className="fw-semibold text-dark fs-6">
                  {selectedEvent.defenseSlot 
                    ? `${selectedEvent.defenseSlot.dateStr} (Slot ${selectedEvent.defenseSlot.slot})`
                    : 'Chưa đăng ký'}
                </span>
              </Col>
              <Col md={6}>
                <span className="text-muted small d-block">Trạng thái duyệt</span>
                <div className="mt-1">
                  {getStatusBadge(selectedEvent.status)}
                </div>
              </Col>
            </Row>

            <div className="mb-4">
              <span className="text-muted small d-block mb-1">Mô tả sự kiện</span>
              <div className="p-3 bg-light rounded text-dark fs-6">
                {selectedEvent.description}
              </div>
            </div>

            <div className="mb-4">
              <span className="text-muted small d-block mb-2">Lịch trình & Kịch bản chi tiết (Agenda)</span>
              <Card className="border border-light-subtle rounded shadow-none">
                <Card.Header className="bg-light py-2 px-3 fw-semibold text-secondary small">
                  Thời gian: {formatTime(selectedEvent.startDate)} - {formatTime(selectedEvent.endDate)} | Tại: {selectedEvent.location}
                </Card.Header>
                <Card.Body className="p-3">
                  <span className="text-muted small d-block mb-2">Kịch bản (Agenda):</span>
                  {selectedEvent.agenda && selectedEvent.agenda.length > 0 ? (
                    selectedEvent.agenda.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-3 mb-2 rounded d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: '#f4faf7', borderLeft: '4px solid #00a389' }}
                      >
                        <div className="fw-semibold text-dark" style={{ fontSize: '13px' }}>{item.content}</div>
                        <span 
                          className="px-3 py-1 rounded-pill fw-semibold"
                          style={{ backgroundColor: '#e6f4ea', color: '#137333', fontSize: '11px' }}
                        >
                          {item.time}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted text-center py-2">Không có kịch bản chi tiết.</div>
                  )}
                </Card.Body>
              </Card>
            </div>

            <div className="mb-4">
              <span className="text-muted small d-block mb-2">Tài liệu & Đề án đính kèm</span>
              <div 
                className="p-3 rounded d-flex justify-content-between align-items-center"
                style={{ backgroundColor: '#f8fbff', border: '1px solid #e1f0ff' }}
              >
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>Đề án sự kiện: {selectedEvent.title}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Đề án sự kiện: {selectedEvent.title}</div>
                </div>
                <Button 
                  href={selectedEvent.proposalDocsLink} 
                  target="_blank" 
                  variant="outline-secondary"
                  size="sm"
                  className="fw-semibold rounded-pill px-3"
                  style={{ fontSize: '12px' }}
                  disabled={!selectedEvent.proposalDocsLink}
                >
                  Xem / Tải về
                </Button>
              </div>
            </div>

            {selectedEvent.pdpFeedback && (
              <div className="mb-4">
                <span className="text-muted small d-block mb-1">Phản hồi từ PDP hiện tại</span>
                <Alert variant={selectedEvent.status === 'approved' || selectedEvent.status === 'approved_to_defend' ? 'success' : 'danger'} className="mb-0">
                  {selectedEvent.pdpFeedback}
                </Alert>
              </div>
            )}

            {showRejectInput && (
              <div className="mb-4 bg-light p-3 rounded border border-danger-subtle">
                {selectedEvent.status === 'pending' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-dark">Lý do từ chối bảo vệ:</Form.Label>
                    <div className="d-flex flex-column gap-2 ms-2">
                      <Form.Check
                        type="radio"
                        label="Từ chối do trùng/bận Slot bảo vệ (Yêu cầu đổi Slot bảo vệ)"
                        name="rejectTypeRadio"
                        id="reject-slot"
                        checked={rejectType === 'rejected_slot'}
                        onChange={() => setRejectType('rejected_slot')}
                      />
                      <Form.Check
                        type="radio"
                        label="Từ chối do nội dung chưa đạt (Yêu cầu sửa nội dung sự kiện)"
                        name="rejectTypeRadio"
                        id="reject-content"
                        checked={rejectType === 'rejected_content'}
                        onChange={() => setRejectType('rejected_content')}
                      />
                      <Form.Check
                        type="radio"
                        label="Từ chối hoàn toàn (Huỷ bỏ đề xuất sự kiện này)"
                        name="rejectTypeRadio"
                        id="reject-final"
                        checked={rejectType === 'rejected_final'}
                        onChange={() => setRejectType('rejected_final')}
                      />
                    </div>
                  </Form.Group>
                )}

                {selectedEvent.status === 'approved_to_defend' && (
                  <div className="alert alert-warning py-2 small mb-3">
                    <strong>Lưu ý:</strong> Đây là bước Duyệt tổng. Từ chối ở bước này sẽ hủy bỏ hoàn toàn sự kiện.
                  </div>
                )}

                <Form.Group>
                  <Form.Label className="fw-bold text-danger d-flex align-items-center">
                    <FaExclamationCircle className="me-2" /> Nhập chi tiết lý do từ chối:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Ghi rõ phản hồi chi tiết cho chủ nhiệm..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="border-danger-subtle"
                  />
                </Form.Group>
              </div>
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
                  
                  {(selectedEvent.status === 'pending' || selectedEvent.status === 'approved_to_defend') && (
                    <>
                      <Button 
                        variant="danger" 
                        onClick={() => setShowRejectInput(true)}
                        className="rounded-pill px-4"
                        disabled={actionLoading}
                      >
                        Từ chối
                      </Button>
                      
                      {selectedEvent.status === 'pending' && (
                        <Button 
                          variant="primary" 
                          onClick={() => handleUpdateStatus('approved_to_defend')}
                          className="rounded-pill px-4 btn-primary"
                          disabled={actionLoading}
                        >
                          Duyệt bảo vệ
                        </Button>
                      )}
                      
                      {selectedEvent.status === 'approved_to_defend' && (
                        <Button 
                          variant="primary" 
                          onClick={() => handleUpdateStatus('approved')}
                          className="rounded-pill px-4 btn-primary"
                          disabled={actionLoading}
                        >
                          Duyệt tổng
                        </Button>
                      )}
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
                    onClick={() => {
                      if (!rejectReason.trim()) {
                        alert('Vui lòng nhập lý do từ chối!');
                        return;
                      }
                      const finalStatus = selectedEvent.status === 'approved_to_defend' ? 'rejected_final' : rejectType;
                      handleUpdateStatus(finalStatus, rejectReason.trim());
                    }}
                    className="rounded-pill px-4"
                    disabled={actionLoading}
                  >
                    Xác nhận Từ chối
                  </Button>
                </>
              )}
            </div>
          </Modal.Body>
        )}
      </Modal>
    </div>
  );
};

export default PdpEvents;
