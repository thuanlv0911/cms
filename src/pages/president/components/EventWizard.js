import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Form } from 'react-bootstrap';
import {
  FaPlus,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaTrash
} from 'react-icons/fa';
import { eventService } from '../../../services/api';

const EventWizard = ({ clubInfo, currentUser, onCancel, onSubmit, loading, eventToEdit, editMode }) => {
  const [eventStep, setEventStep] = useState(() => {
    return editMode === 'slot_only' ? 4 : 1;
  });
  const [newEvent, setNewEvent] = useState(() => {
    if (eventToEdit) {
      const mappedAgenda = eventToEdit.agenda ? eventToEdit.agenda.map(ag => {
        const timePart = ag.time.includes('T') ? ag.time.split('T')[1] : ag.time;
        return {
          id: ag.id,
          time: timePart,
          content: ag.content
        };
      }) : [];

      return {
        title: eventToEdit.title || '',
        description: eventToEdit.description || '',
        expectedParticipants: eventToEdit.expectedParticipants || '',
        proposalDocsLink: eventToEdit.proposalDocsLink || '',
        startDate: eventToEdit.startDate || '',
        endDate: eventToEdit.endDate || '',
        locationType: eventToEdit.type === 'Sự kiện ngoài trường' ? 'outside' : 'inside',
        selectLocation: eventToEdit.type === 'Sự kiện trong trường' ? eventToEdit.location : 'Sảnh tòa Alpha',
        customLocation: eventToEdit.type === 'Sự kiện ngoài trường' ? eventToEdit.location : '',
        youtubeLink: eventToEdit.youtubeLink || '',
        registrationLink: eventToEdit.registrationLink || '',
        sendEmail: eventToEdit.sendEmail || false,
        banner: eventToEdit.banner || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop',
        agenda: mappedAgenda.length > 0 ? mappedAgenda : [{ id: 'ag-init', time: '18:00', content: 'Đón tiếp người tham gia' }],
        selectedDefenseSlot: eventToEdit.defenseSlot || null
      };
    }

    return {
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
    };
  });

  const [defenseDate, setDefenseDate] = useState(() => {
    return eventToEdit && eventToEdit.defenseSlot ? eventToEdit.defenseSlot.isoDate : '';
  });
  const [defenseSlotNum, setDefenseSlotNum] = useState(() => {
    return eventToEdit && eventToEdit.defenseSlot ? eventToEdit.defenseSlot.slot.toString() : '';
  });
  const [errors, setErrors] = useState({});
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    eventService.getAll()
      .then(data => setAllEvents(data))
      .catch(err => console.error("Lỗi khi tải danh sách sự kiện để kiểm tra slot:", err));
  }, []);

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const getMinEventStartDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 7);
    const yyyy = minDate.getFullYear();
    const mm = String(minDate.getMonth() + 1).padStart(2, '0');
    const dd = String(minDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T00:00`;
  };

  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      if (!newEvent.title.trim()) {
        newErrors.title = 'Vui lòng nhập tên sự kiện!';
      }
      if (!newEvent.description.trim()) {
        newErrors.description = 'Vui lòng nhập mô tả sự kiện!';
      }
      if (!newEvent.expectedParticipants || !newEvent.expectedParticipants.toString().trim()) {
        newErrors.expectedParticipants = 'Vui lòng nhập số người tham gia dự kiến!';
      } else if (!/^\d+$/.test(newEvent.expectedParticipants.toString().trim())) {
        newErrors.expectedParticipants = 'Số lượng người tham gia phải là số nguyên dương (không chứa chữ hoặc ký tự đặc biệt)!';
      } else if (parseInt(newEvent.expectedParticipants, 10) <= 0) {
        newErrors.expectedParticipants = 'Số lượng người tham gia phải lớn hơn 0!';
      } else if (parseInt(newEvent.expectedParticipants, 10) > 1000000) {
        newErrors.expectedParticipants = 'Số lượng người tham gia dự kiến không được vượt quá 1.000.000 người!';
      }
      if (!newEvent.proposalDocsLink.trim()) {
        newErrors.proposalDocsLink = 'Vui lòng nhập link Google Docs đề án!';
      } else if (!isValidUrl(newEvent.proposalDocsLink.trim())) {
        newErrors.proposalDocsLink = 'Đường dẫn không hợp lệ. Vui lòng nhập link URL (ví dụ: https://...)!';
      }
      if (newEvent.banner && newEvent.banner.trim() && !isValidUrl(newEvent.banner.trim())) {
        newErrors.banner = 'Đường dẫn ảnh banner không hợp lệ!';
      }
    }

    if (stepNum === 2) {
      if (!newEvent.startDate) {
        newErrors.startDate = 'Vui lòng nhập thời gian bắt đầu!';
      } else {
        const minStartStr = getMinEventStartDate();
        if (new Date(newEvent.startDate) < new Date(minStartStr)) {
          newErrors.startDate = 'Thời gian bắt đầu sự kiện phải cách ngày hiện tại ít nhất 7 ngày!';
        }
      }
      if (!newEvent.endDate) {
        newErrors.endDate = 'Vui lòng nhập thời gian kết thúc!';
      }
      if (newEvent.startDate && newEvent.endDate) {
        if (new Date(newEvent.startDate) >= new Date(newEvent.endDate)) {
          newErrors.endDate = 'Thời gian bắt đầu phải diễn ra trước thời gian kết thúc!';
        }
      }
      if (newEvent.locationType === 'outside' && !newEvent.customLocation.trim()) {
        newErrors.customLocation = 'Vui lòng nhập địa điểm tổ chức ngoài trường!';
      }
    }

    if (stepNum === 3) {
      const agendaErrors = {};
      newEvent.agenda.forEach((ag, index) => {
        const agErr = {};
        if (!ag.time) {
          agErr.time = 'Vui lòng chọn thời gian!';
        } else {
          if (newEvent.startDate && newEvent.endDate) {
            const agDateTimeStr = newEvent.startDate.split('T')[0] + 'T' + ag.time;
            const agDate = new Date(agDateTimeStr);
            const start = new Date(newEvent.startDate);
            const end = new Date(newEvent.endDate);
            
            if (agDate < start || agDate > end) {
              const startHM = newEvent.startDate.includes('T') ? newEvent.startDate.split('T')[1] : '';
              const endHM = newEvent.endDate.includes('T') ? newEvent.endDate.split('T')[1] : '';
              agErr.time = `Thời gian phải nằm trong khoảng từ ${startHM} đến ${endHM}!`;
            }
          }
        }
        if (!ag.content.trim()) {
          agErr.content = 'Vui lòng nhập nội dung hoạt động!';
        }
        if (Object.keys(agErr).length > 0) {
          agendaErrors[index] = agErr;
        }
      });
      if (Object.keys(agendaErrors).length > 0) {
        newErrors.agenda = agendaErrors;
      }
    }

    if (stepNum === 4) {
      if (!newEvent.selectedDefenseSlot) {
        newErrors.selectedDefenseSlot = 'Vui lòng chọn 1 slot lịch bảo vệ đề án!';
      } else {
        const slot = newEvent.selectedDefenseSlot.slot;
        const dateStr = newEvent.selectedDefenseSlot.dateStr;
        
        const bookedEventsOnDate = allEvents.filter(e => 
          e.defenseSlot && 
          e.defenseSlot.dateStr === dateStr &&
          (!eventToEdit || e.id !== eventToEdit.id)
        );

        if (slot === 4) {
          newErrors.selectedDefenseSlot = 'Slot 4 chỉ dùng làm dự phòng và không thể đặt!';
        } else if (bookedEventsOnDate.some(e => e.defenseSlot.slot === slot)) {
          newErrors.selectedDefenseSlot = `Slot ${slot} vào ngày này đã được đăng ký bởi sự kiện khác!`;
        } else if (slot === 3 && bookedEventsOnDate.some(e => e.defenseSlot.slot === 2)) {
          newErrors.selectedDefenseSlot = 'Slot 3 bị khoá do Slot 2 vào ngày này đã được đăng ký!';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleDateChange = (field, value) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const updated = { ...prev };
      delete updated.startDate;
      delete updated.endDate;
      return updated;
    });
  };

  const handleLocationTypeChange = (type) => {
    setNewEvent(prev => ({ ...prev, locationType: type }));
    if (errors.customLocation) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.customLocation;
        return updated;
      });
    }
  };

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
    { slotNum: 1, timeRange: '08:00 - 10:00' },
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

    if (errors.selectedDefenseSlot) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.selectedDefenseSlot;
        return updated;
      });
    }
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
    if (errors.agenda) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.agenda;
        return updated;
      });
    }
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
    if (errors.agenda) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.agenda;
        return updated;
      });
    }
  };

  const handleNextStep = () => {
    if (validateStep(eventStep)) {
      setEventStep(prev => prev + 1);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (eventStep < 4) {
      handleNextStep();
      return;
    }
    if (!validateStep(4)) {
      return;
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
          <h4 className="fw-bold mb-0 text-dark">
            {eventToEdit ? (editMode === 'slot_only' ? 'Đăng ký lại lịch bảo vệ' : 'Chỉnh sửa thông tin Sự kiện') : 'Đăng ký tổ chức Sự kiện'}
          </h4>
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
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  isInvalid={!!errors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Mô tả sự kiện <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Mô tả tóm tắt nội dung, ý nghĩa của sự kiện..."
                  value={newEvent.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  isInvalid={!!errors.description}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>

              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Số lượng người tham gia dự kiến <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: 50, 100..."
                      value={newEvent.expectedParticipants}
                      onChange={(e) => handleFieldChange('expectedParticipants', e.target.value)}
                      isInvalid={!!errors.expectedParticipants}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.expectedParticipants}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Link Google Docs đề án <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập đường dẫn Google Drive hoặc Docs chứa đề án sự kiện"
                      value={newEvent.proposalDocsLink}
                      onChange={(e) => handleFieldChange('proposalDocsLink', e.target.value)}
                      isInvalid={!!errors.proposalDocsLink}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.proposalDocsLink}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Đường dẫn ảnh Banner sự kiện (Link ảnh)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập link ảnh banner sự kiện (Mặc định sẽ có ảnh mẫu nếu để trống)"
                  value={newEvent.banner}
                  onChange={(e) => handleFieldChange('banner', e.target.value)}
                  isInvalid={!!errors.banner}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.banner}
                </Form.Control.Feedback>
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
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      isInvalid={!!errors.startDate}
                      min={getMinEventStartDate()}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.startDate}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Thời gian kết thúc <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      isInvalid={!!errors.endDate}
                      min={newEvent.startDate || getMinEventStartDate()}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.endDate}
                    </Form.Control.Feedback>
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
                    onChange={() => handleLocationTypeChange('inside')}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Ngoài trường"
                    name="locationType"
                    checked={newEvent.locationType === 'outside'}
                    onChange={() => handleLocationTypeChange('outside')}
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
                    onChange={(e) => handleFieldChange('customLocation', e.target.value)}
                    isInvalid={!!errors.customLocation}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.customLocation}
                  </Form.Control.Feedback>
                </Form.Group>
              )}
            </div>
          )}

          {eventStep === 3 && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-orange">Bước 3: Chương trình chi tiết (Agenda)</h5>
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
                  {newEvent.agenda.map((ag, index) => {
                    const rowError = errors.agenda && errors.agenda[index];
                    return (
                      <tr key={ag.id}>
                        <td>
                          <Form.Control
                            type="time"
                            value={ag.time}
                            onChange={(e) => handleUpdateAgendaRow(ag.id, 'time', e.target.value)}
                            isInvalid={rowError && !!rowError.time}
                          />
                          {rowError && rowError.time && (
                            <Form.Control.Feedback type="invalid">
                              {rowError.time}
                            </Form.Control.Feedback>
                          )}
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            placeholder="Nhập mô tả hoạt động..."
                            value={ag.content}
                            onChange={(e) => handleUpdateAgendaRow(ag.id, 'content', e.target.value)}
                            isInvalid={rowError && !!rowError.content}
                          />
                          {rowError && rowError.content && (
                            <Form.Control.Feedback type="invalid">
                              {rowError.content}
                            </Form.Control.Feedback>
                          )}
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
                    );
                  })}
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
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold d-block mb-3">Chọn khung giờ Slot:</Form.Label>
                <div className="d-flex flex-column gap-3">
                  {(() => {
                    let dateStr = '';
                    if (defenseDate) {
                      const [year, month, day] = defenseDate.split('-');
                      dateStr = `${day}/${month}/${year}`;
                    }

                    const bookedEventsOnDate = dateStr
                      ? allEvents.filter(e => 
                          e.defenseSlot && 
                          e.defenseSlot.dateStr === dateStr && 
                          (!eventToEdit || e.id !== eventToEdit.id)
                        )
                      : [];

                    return defenseSlotsDef.map((s) => {
                      let isDisabled = s.slotNum === 4;
                      let labelNote = '';

                      if (s.slotNum === 4) {
                        labelNote = ' (Dự phòng - Khoá)';
                      }

                      const isBooked = bookedEventsOnDate.some(e => e.defenseSlot.slot === s.slotNum);
                      if (isBooked) {
                        isDisabled = true;
                        labelNote = ' (Đã được đặt)';
                      }

                      if (s.slotNum === 3 && bookedEventsOnDate.some(e => e.defenseSlot.slot === 2)) {
                        isDisabled = true;
                        labelNote = ' (Khoá - Slot 2 đã được đặt)';
                      }

                      return (
                        <Form.Check
                          key={s.slotNum}
                          type="radio"
                          id={`slot-radio-${s.slotNum}`}
                          name="defenseSlotRadio"
                          label={`Slot ${s.slotNum} (${s.timeRange})${labelNote}`}
                          checked={parseInt(defenseSlotNum, 10) === s.slotNum}
                          disabled={isDisabled || !defenseDate}
                          onChange={() => {
                            setDefenseSlotNum(s.slotNum.toString());
                            updateDefenseSlot(defenseDate, s.slotNum.toString());
                          }}
                          className={`fs-6 ${isDisabled ? 'text-muted' : ''}`}
                          style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                        />
                      );
                    });
                  })()}
                </div>
                {errors.selectedDefenseSlot && (
                  <div className="text-danger small mt-2 fw-semibold">
                    {errors.selectedDefenseSlot}
                  </div>
                )}
              </Form.Group>
            </div>
          )}

          <div className="d-flex justify-content-between mt-5 pt-3 border-top">
            {eventStep > 1 && editMode !== 'slot_only' ? (
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
                {eventToEdit ? 'Cập nhật & Gửi lại' : 'Gửi phê duyệt'} <FaCheckCircle className="ms-2" />
              </Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EventWizard;
