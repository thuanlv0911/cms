import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, Form } from 'react-bootstrap';
import {
  FaPlus,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaTrash
} from 'react-icons/fa';

const EventWizard = ({ clubInfo, currentUser, onCancel, onSubmit, loading }) => {
  const [eventStep, setEventStep] = useState(1);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    expectedParticipants: '',
    proposalDocsLink: '',
    startDate: '',
    endDate: '',
    locationType: 'inside',
    selectLocation: 'Sảnh tòa Alpha',
    customLocation: '',
    youtubeLink: '',
    registrationLink: '',
    sendEmail: false,
    banner: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop',
    agenda: [{ id: 'ag-init', time: '18:00', content: 'Đón tiếp người tham gia' }],
    selectedDefenseSlot: null
  });

  const [defenseDate, setDefenseDate] = useState('');
  const [defenseSlotNum, setDefenseSlotNum] = useState('');

  const CAMPUS_LOCATIONS = [
    'Sảnh tòa Alpha',
    'Sảnh tòa Beta',
    'Sảnh tòa Gamma',
    'Sảnh tòa Delta',
    'Phòng Seminar tòa Alpha',
    'Phòng Seminar tòa Beta',
    'Phòng Seminar tòa Gamma',
    'Phòng Seminar tòa Delta',
    'Hội trường tòa Delta',
    'Sân bóng đá',
    'Sân bóng rổ',
    'Khu thể thao Vovinam'
  ];

  const defenseSlotsDef = [
    { slotNum: 1, timeRange: '09:00 - 11:00' },
    { slotNum: 2, timeRange: '13:00 - 15:00' },
    { slotNum: 3, timeRange: '15:30 - 17:30' },
    { slotNum: 4, timeRange: '18:00 - 20:00' }
  ];

  const updateDefenseSlot = (dateVal, slotVal) => {
    if (!dateVal || !slotVal) {
      setNewEvent(prev => ({ ...prev, selectedDefenseSlot: null }));
      return;
    }

    const slotDef = defenseSlotsDef.find(s => s.slotNum === parseInt(slotVal, 10));
    if (!slotDef) return;

    const [year, month, day] = dateVal.split('-');
    const dateStr = `${day}/${month}/${year}`;

    const dateObj = new Date(dateVal);
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = dayNames[dateObj.getDay()];

    setNewEvent(prev => ({
      ...prev,
      selectedDefenseSlot: {
        dateStr: dateStr,
        isoDate: dateVal,
        dayName: dayName,
        slot: slotDef.slotNum,
        timeRange: slotDef.timeRange
      }
    }));
  };

  const handleAddAgendaRow = () => {
    setNewEvent(prev => ({
      ...prev,
      agenda: [...prev.agenda, { id: `ag-${Date.now()}`, time: '18:00', content: '' }]
    }));
  };

  const handleUpdateAgendaRow = (id, field, value) => {
    setNewEvent(prev => ({
      ...prev,
      agenda: prev.agenda.map(ag => ag.id === id ? { ...ag, [field]: value } : ag)
    }));
  };

  const handleDeleteAgendaRow = (id) => {
    if (newEvent.agenda.length === 1) {
      alert('Chương trình sự kiện (agenda) phải chứa ít nhất 1 hoạt động!');
      return;
    }
    setNewEvent(prev => ({
      ...prev,
      agenda: prev.agenda.filter(ag => ag.id !== id)
    }));
  };

  const handleNextStep = () => {
    if (eventStep === 1) {
      if (!newEvent.title.trim()) return alert('Vui lòng nhập tên sự kiện!');
      if (!newEvent.description.trim()) return alert('Vui lòng nhập mô tả sự kiện!');
      if (!newEvent.expectedParticipants) return alert('Vui lòng nhập số người tham gia dự kiến!');
      if (!newEvent.proposalDocsLink.trim()) return alert('Vui lòng nhập link Google Docs đề án!');
    }
    if (eventStep === 2) {
      if (!newEvent.startDate || !newEvent.endDate) return alert('Vui lòng nhập thời gian bắt đầu và kết thúc!');
      if (new Date(newEvent.startDate) >= new Date(newEvent.endDate)) {
        return alert('Thời gian bắt đầu phải diễn ra trước thời gian kết thúc!');
      }
      if (newEvent.locationType === 'outside' && !newEvent.customLocation.trim()) {
        return alert('Vui lòng nhập địa điểm tổ chức ngoài trường!');
      }
    }
    if (eventStep === 3) {
      const hasEmptyAgenda = newEvent.agenda.some(ag => !ag.time || !ag.content.trim());
      if (hasEmptyAgenda) return alert('Vui lòng điền đầy đủ thông tin các hàng trong chương trình!');
    }
    setEventStep(prev => prev + 1);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.selectedDefenseSlot) {
      return alert('Vui lòng chọn 1 slot lịch bảo vệ đề án!');
    }

    const finalLocation = newEvent.locationType === 'inside'
      ? newEvent.selectLocation
      : newEvent.customLocation.trim();

    const eventPayload = {
      clubId: currentUser.clubId,
      clubName: clubInfo ? clubInfo.name : 'CLB của tôi',
      title: newEvent.title.trim(),
      description: newEvent.description.trim(),
      expectedParticipants: parseInt(newEvent.expectedParticipants, 10),
      proposalDocsLink: newEvent.proposalDocsLink.trim(),
      location: finalLocation,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      type: newEvent.locationType === 'inside' ? 'Sự kiện trong trường' : 'Sự kiện ngoài trường',
      youtubeLink: newEvent.youtubeLink || '',
      registrationLink: newEvent.registrationLink || '',
      sendEmail: newEvent.sendEmail,
      banner: newEvent.banner || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop',
      agenda: newEvent.agenda.map((ag, index) => ({
        id: `ag-${Date.now()}-${index}`,
        time: newEvent.startDate.split('T')[0] + 'T' + ag.time,
        content: ag.content
      })),
      defenseSlot: newEvent.selectedDefenseSlot,
      status: 'pending',
      pdpFeedback: '',
      hasReport: false
    };

    onSubmit(eventPayload);
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h4 className="fw-bold mb-0 text-dark">Đăng ký tổ chức Sự kiện</h4>
          <Button variant="outline-secondary" className="rounded-pill px-3" onClick={onCancel}>
            Quay lại danh sách
          </Button>
        </div>

        <div className="d-flex justify-content-between mb-5 text-center px-lg-5">
          {[
            { step: 1, title: 'Thông tin cơ bản' },
            { step: 2, title: 'Thời gian & Địa điểm' },
            { step: 3, title: 'Chương trình (Agenda)' },
            { step: 4, title: 'Lịch bảo vệ đề án' }
          ].map((s) => (
            <div key={s.step} className="position-relative flex-grow-1">
              <div className="d-flex flex-column align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold mb-2"
                  style={{
                    width: '35px',
                    height: '35px',
                    backgroundColor: eventStep === s.step ? 'var(--fpt-orange)' : eventStep > s.step ? '#28a745' : '#e9ecef',
                    color: eventStep >= s.step ? '#fff' : '#495057'
                  }}
                >
                  {eventStep > s.step ? '✓' : s.step}
                </div>
                <span className={`small fw-semibold ${eventStep === s.step ? 'text-dark' : 'text-muted'}`}>
                  {s.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Form onSubmit={handleFormSubmit}>
          {eventStep === 1 && (
            <div>
              <h5 className="fw-bold mb-4 text-orange">Bước 1: Nhập thông tin sự kiện</h5>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Tên sự kiện <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập tên sự kiện (VD: Workshop Generative AI, Giải bóng đá...)"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Mô tả sự kiện <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Mô tả tóm tắt nội dung, ý nghĩa của sự kiện..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </Form.Group>

              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Số lượng người tham gia dự kiến <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      placeholder="Ví dụ: 50, 100..."
                      value={newEvent.expectedParticipants}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, expectedParticipants: e.target.value }))}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Link Google Docs đề án <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="Nhập đường dẫn Google Drive hoặc Docs chứa đề án sự kiện"
                      value={newEvent.proposalDocsLink}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, proposalDocsLink: e.target.value }))}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Đường dẫn ảnh Banner sự kiện (Link ảnh)</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="Nhập link ảnh banner sự kiện (Mặc định sẽ có ảnh mẫu nếu để trống)"
                  value={newEvent.banner}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, banner: e.target.value }))}
                />
              </Form.Group>
            </div>
          )}

          {eventStep === 2 && (
            <div>
              <h5 className="fw-bold mb-4 text-orange">Bước 2: Thời gian và địa điểm diễn ra</h5>

              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Thời gian bắt đầu <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Thời gian kết thúc <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Loại địa điểm tổ chức <span className="text-danger">*</span></Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    label="Trong trường"
                    name="locationType"
                    checked={newEvent.locationType === 'inside'}
                    onChange={() => setNewEvent(prev => ({ ...prev, locationType: 'inside' }))}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Ngoài trường"
                    name="locationType"
                    checked={newEvent.locationType === 'outside'}
                    onChange={() => setNewEvent(prev => ({ ...prev, locationType: 'outside' }))}
                  />
                </div>
              </Form.Group>

              {newEvent.locationType === 'inside' ? (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Chọn địa điểm trong trường <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={newEvent.selectLocation}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, selectLocation: e.target.value }))}
                  >
                    {CAMPUS_LOCATIONS.map((loc, idx) => (
                      <option key={idx} value={loc}>{loc}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              ) : (
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Nhập địa điểm ngoài trường <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập cụ thể địa chỉ nơi diễn ra sự kiện..."
                    value={newEvent.customLocation}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, customLocation: e.target.value }))}
                    required
                  />
                </Form.Group>
              )}
            </div>
          )}

          {eventStep === 3 && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-orange">Bước 3:Chương trình chi tiết (Agenda)</h5>
                <Button variant="primary" size="sm" className="btn-primary rounded-pill d-flex align-items-center" onClick={handleAddAgendaRow}>
                  <FaPlus className="me-1" /> Thêm hoạt động
                </Button>
              </div>

              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '180px' }}>Thời gian</th>
                    <th>Nội dung</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {newEvent.agenda.map((ag) => (
                    <tr key={ag.id}>
                      <td>
                        <Form.Control
                          type="time"
                          value={ag.time}
                          onChange={(e) => handleUpdateAgendaRow(ag.id, 'time', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          placeholder="Nhập mô tả hoạt động..."
                          value={ag.content}
                          onChange={(e) => handleUpdateAgendaRow(ag.id, 'content', e.target.value)}
                          required
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Button
                          variant="link"
                          className="text-danger p-0"
                          onClick={() => handleDeleteAgendaRow(ag.id)}
                        >
                          <FaTrash size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {eventStep === 4 && (
            <div>
              <h5 className="fw-bold mb-4 text-orange">Bước 4: Đăng ký lịch bảo vệ đề án</h5>

              <Form.Group className="mb-4" style={{ maxWidth: '400px' }}>
                <Form.Label className="fw-semibold">Chọn ngày bảo vệ đề án:</Form.Label>
                <Form.Control
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={defenseDate}
                  onChange={(e) => {
                    setDefenseDate(e.target.value);
                    updateDefenseSlot(e.target.value, defenseSlotNum);
                  }}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold d-block mb-3">Chọn khung giờ Slot:</Form.Label>
                <div className="d-flex flex-column gap-3">
                  {defenseSlotsDef.map((s) => (
                    <Form.Check
                      key={s.slotNum}
                      type="radio"
                      id={`slot-radio-${s.slotNum}`}
                      name="defenseSlotRadio"
                      label={`Slot ${s.slotNum} (${s.timeRange})`}
                      checked={parseInt(defenseSlotNum, 10) === s.slotNum}
                      onChange={() => {
                        setDefenseSlotNum(s.slotNum.toString());
                        updateDefenseSlot(defenseDate, s.slotNum.toString());
                      }}
                      className="fs-6"
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              </Form.Group>
            </div>
          )}

          <div className="d-flex justify-content-between mt-5 pt-3 border-top">
            {eventStep > 1 ? (
              <Button
                variant="secondary"
                className="rounded-pill px-4 d-flex align-items-center"
                onClick={() => setEventStep(prev => prev - 1)}
              >
                <FaArrowLeft className="me-2" /> Quay lại
              </Button>
            ) : (
              <Button
                variant="outline-secondary"
                className="rounded-pill px-4"
                onClick={onCancel}
              >
                Hủy bỏ
              </Button>
            )}

            {eventStep < 4 ? (
              <Button
                variant="primary"
                className="btn-primary rounded-pill px-4 d-flex align-items-center"
                onClick={handleNextStep}
              >
                Tiếp theo <FaArrowRight className="ms-2" />
              </Button>
            ) : (
              <Button
                variant="success"
                className="rounded-pill px-4 d-flex align-items-center"
                type="submit"
                disabled={loading}
              >
                Gửi phê duyệt <FaCheckCircle className="ms-2" />
              </Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EventWizard;
