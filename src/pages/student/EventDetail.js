import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Row, Col, Form, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { eventService, clubService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';

const EventDetail = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [club, setClub] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [agendaTime, setAgendaTime] = useState('');
  const [agendaContent, setAgendaContent] = useState('');
  const [agendaError, setAgendaError] = useState('');

  useEffect(() => {
    setLoading(true);
    let eventDataFetched = null;
    eventService.getById(id)
      .then((eventData) => {
        eventDataFetched = eventData;
        setEvent(eventData);
        
        const promises = [];
        if (eventData.clubId) {
          promises.push(clubService.getById(eventData.clubId));
          promises.push(eventService.getByClub(eventData.clubId));
        } else {
          promises.push(Promise.resolve(null));
          promises.push(Promise.resolve([]));
        }
        return Promise.all(promises);
      })
      .then(([clubData, clubEvents]) => {
        setClub(clubData);
        
        const otherEvents = clubEvents.filter(
          (e) => e.id !== eventDataFetched.id && e.status === 'approved'
        );
        
        const sorted = otherEvents
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
          .slice(0, 3);
          
        setRelatedEvents(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết sự kiện:', err);
        setLoading(false);
      });
  }, [id]);

  const isAuthorized = currentUser && (
    currentUser.role === 'admin' ||
    currentUser.role === 'pdp' ||
    (currentUser.role === 'student' && currentUser.isPresident && currentUser.clubId === event?.clubId)
  );

  const formatFullDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAgendaTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddAgenda = async (e) => {
    e.preventDefault();
    setAgendaError('');

    if (!agendaTime || !agendaContent.trim()) {
      setAgendaError('Vui lòng nhập đầy đủ thời gian và nội dung hoạt động!');
      return;
    }

    const milestoneTime = new Date(agendaTime);
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);

    if (milestoneTime < eventStart || milestoneTime > eventEnd) {
      setAgendaError(
        `Thời gian hoạt động phải nằm trong khoảng diễn ra sự kiện (từ ${formatFullDate(event.startDate)} đến ${formatFullDate(event.endDate)})!`
      );
      return;
    }

    const newMilestone = {
      id: Date.now().toString(),
      time: agendaTime,
      content: agendaContent.trim()
    };

    const currentAgenda = event.agenda || [];
    const updatedAgenda = [...currentAgenda, newMilestone].sort(
      (a, b) => new Date(a.time) - new Date(b.time)
    );

    try {
      const updatedEvent = await eventService.update(event.id, { agenda: updatedAgenda });
      setEvent(updatedEvent);
      setAgendaTime('');
      setAgendaContent('');
    } catch (err) {
      console.error('Lỗi khi thêm agenda:', err);
      setAgendaError('Không thể lưu agenda vào máy chủ.');
    }
  };

  const handleDeleteAgenda = async (milestoneId) => {
    const currentAgenda = event.agenda || [];
    const updatedAgenda = currentAgenda.filter(item => item.id !== milestoneId);

    try {
      const updatedEvent = await eventService.update(event.id, { agenda: updatedAgenda });
      setEvent(updatedEvent);
    } catch (err) {
      console.error('Lỗi khi xóa agenda:', err);
      alert('Không thể xóa agenda.');
    }
  };

  const renderSchedule = () => {
    if (!event.startDate || !event.endDate) return null;

    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    const isSameDay = start.toDateString() === end.toDateString();

    const formatDateOnly = (date) => {
      return date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
    };

    const formatTimeOnly = (date) => {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    if (isSameDay) {
      return (
        <div>
          <h5 className="fw-bold text-dark mb-3">Thời gian & Địa điểm</h5>
          <div className="border rounded p-3 mb-3 bg-white shadow-sm border-light">
            <div className="d-flex align-items-center mb-2">
              <FaCalendarAlt className="me-2 text-primary" />
              <span className="fw-bold text-dark">
                Ngày diễn ra: {formatDateOnly(start)}
              </span>
            </div>
            <div className="ps-4 text-muted mb-2">
              Thời gian: {formatTimeOnly(start)} - {formatTimeOnly(end)}
            </div>
            <div className="d-flex align-items-center">
              <FaMapMarkerAlt className="me-2 text-danger" />
              <span className="fw-bold text-dark">Địa điểm:</span>
              <span className="ms-2 text-muted">{event.location}</span>
            </div>
          </div>
        </div>
      );
    } else {
      const days = [];
      let curr = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      while (curr <= last) {
        days.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
      }

      return (
        <div>
          <h5 className="fw-bold text-dark mb-3">Lịch trình & Địa điểm</h5>
          {days.map((day, index) => {
            let timeString = "Cả ngày";
            if (index === 0) {
              timeString = `Từ ${formatTimeOnly(start)}`;
            } else if (index === days.length - 1) {
              timeString = `Đến ${formatTimeOnly(end)}`;
            }

            return (
              <div key={index} className="border rounded p-3 mb-3 bg-white shadow-sm border-light">
                <div className="d-flex align-items-center mb-2">
                  <FaCalendarAlt className="me-2 text-primary" />
                  <span className="fw-bold text-dark">
                    Ngày {index + 1}: {formatDateOnly(day)}
                  </span>
                </div>
                <div className="ps-4 text-muted mb-2">
                  Thời gian: {timeString}
                </div>
                <div className="d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2 text-danger" />
                  <span className="fw-bold text-dark">Địa điểm:</span>
                  <span className="ms-2 text-muted">{event.location}</span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  };

  const renderAgendaSection = () => {
    const agendaList = event?.agenda || [];

    return (
      <div className="mt-5 border-top pt-4">
        <h4 className="fw-bold text-dark mb-4">Agenda Sự Kiện</h4>
        
        {agendaList.length === 0 ? (
          <p className="text-muted italic">Chưa có mốc thời gian (agenda) nào được thiết lập.</p>
        ) : (
          <div className="mb-4">
            {agendaList.map((item, index) => (
              <div key={item.id || index} className="mb-3">
                <div className="bg-light p-3 rounded shadow-sm border border-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary text-white fw-bold">
                      {formatAgendaTime(item.time)}
                    </span>
                    {isAuthorized && (
                      <Button 
                        variant="link" 
                        className="text-danger p-0 text-decoration-none btn-sm"
                        onClick={() => handleDeleteAgenda(item.id)}
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
                  <div className="text-dark fw-semibold">{item.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAuthorized && (
          <Card className="border border-dashed p-4 mt-4 bg-light">
            <h5 className="fw-bold text-dark mb-3">Thêm mốc hoạt động mới</h5>
            <Form onSubmit={handleAddAgenda}>
              {agendaError && <Alert variant="danger">{agendaError}</Alert>}
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-muted">Thời gian</Form.Label>
                    <Form.Control 
                      type="datetime-local" 
                      value={agendaTime} 
                      onChange={(e) => setAgendaTime(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="small fw-semibold text-muted">Nội dung hoạt động</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Ví dụ: Khai mạc, Teabreak, Bắt đầu thuyết trình..." 
                      value={agendaContent} 
                      onChange={(e) => setAgendaContent(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="text-end mt-3">
                <Button type="submit" variant="primary" className="fw-semibold">
                  Thêm vào Agenda
                </Button>
              </div>
            </Form>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="py-5 text-center">
        <h2>Không tìm thấy sự kiện!</h2>
        <Button as={Link} to="/events" variant="primary" className="mt-3">Quay lại danh sách sự kiện</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm overflow-hidden mb-4">
            <div style={{ maxHeight: '400px', overflow: 'hidden' }}>
              <img
                src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop'}
                alt={event.title}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
            <Card.Body className="p-4">
              <h1 className="fw-bold text-dark mb-4">{event.title}</h1>
              
              <h5 className="fw-bold text-dark mb-3">Mô tả chi tiết sự kiện</h5>
              <div className="text-dark fs-6 mb-5" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {event.description}
              </div>

              {renderSchedule()}

              {renderAgendaSection()}
            </Card.Body>
          </Card>

          <div className="mt-4 pt-2">
            <h4 className="fw-bold text-dark mb-3">Sự kiện liên quan</h4>
            {relatedEvents.length > 0 ? (
              <Row xs={1} md={2} lg={3} className="g-3">
                {relatedEvents.map((rEvent) => (
                  <Col key={rEvent.id}>
                    <EventCard event={rEvent} truncate={true} showDetailButton={false} />
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-muted italic small mb-0">Không có sự kiện liên quan nào khác của câu lạc bộ này.</p>
            )}
          </div>
        </Col>

        <Col lg={4}>
          <div className="sticky-top" style={{ top: '90px' }}>
            {club && (
              <Card className="border-0 shadow-sm p-4 text-center mb-4">
                <h6 className="fw-bold mb-3 text-muted">Câu lạc bộ tổ chức</h6>
                <div className="d-flex justify-content-center mb-3">
                  <div 
                    style={{ 
                      width: '90px', 
                      height: '90px', 
                      borderRadius: '50%', 
                      overflow: 'hidden',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <img
                      src={club.image || `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop`}
                      alt={club.name}
                      className="w-100 h-100 object-fit-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop';
                      }}
                    />
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-3">{club.name}</h5>
                <Button
                  as={Link}
                  to={`/clubs/${club.id}`}
                  variant="outline-primary"
                  className="w-100 rounded-pill btn-sm fw-semibold"
                >
                  Xem CLB
                </Button>
              </Card>
            )}

            {event.registrationLink ? (
              <Button
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="w-100 py-3 fw-bold d-flex align-items-center justify-content-center shadow-sm fs-5 rounded-pill"
              >
                Đăng ký tham gia
              </Button>
            ) : (
              <div className="alert alert-secondary text-center py-3 fw-semibold">
                Sự kiện này không yêu cầu đăng ký trước
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default EventDetail;
