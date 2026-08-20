import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/events?status=approved')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải lịch sự kiện:', err);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
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

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">Lịch Sự Kiện Sinh Viên</h1>
        <p className="text-muted">Tổng hợp tất cả các sự kiện và hoạt động chính thức đã được phê duyệt</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-5 bg-white shadow-sm rounded">
          <p className="text-muted fs-5 mb-0">Hiện chưa có sự kiện nào được công bố.</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {events.map((event) => (
            <Col key={event.id}>
              <Card className="h-100 border-0 shadow-sm overflow-hidden">
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img
                    src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop'}
                    alt={event.title}
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                <Card.Body className="d-flex flex-column p-4">
                  <Badge bg="info" className="align-self-start mb-2 px-2 py-1 text-dark fw-semibold">
                    {event.clubName}
                  </Badge>
                  <Card.Title className="fw-bold fs-5 mb-3">{event.title}</Card.Title>
                  
                  <div className="text-muted small mb-2 d-flex align-items-center">
                    <FaCalendarAlt className="me-2 text-primary" />
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </div>
                  <div className="text-muted small mb-3 d-flex align-items-center">
                    <FaMapMarkerAlt className="me-2 text-danger" />
                    {event.location}
                  </div>
                  
                  <Card.Text className="text-muted small flex-grow-1">
                    {event.description}
                  </Card.Text>
                  
                  {event.registrationLink && (
                    <Button
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="warning"
                      className="mt-4 w-100 fw-semibold text-dark d-flex align-items-center justify-content-center"
                    >
                      Đăng ký tham gia <FaExternalLinkAlt className="ms-2" size={12} />
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default EventCalendar;
