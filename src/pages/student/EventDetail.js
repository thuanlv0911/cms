import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaExternalLinkAlt, FaUsers } from 'react-icons/fa';
import { eventService } from '../../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getById(id)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết sự kiện:', err);
        setLoading(false);
      });
  }, [id]);

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
              <div className="d-flex align-items-center gap-2 mb-3">
                <Badge bg="info" className="px-3 py-2 text-dark fw-semibold">
                  {event.clubName}
                </Badge>
                <Badge bg="success" className="px-3 py-2 text-white">
                  Đã duyệt
                </Badge>
              </div>
              
              <h1 className="fw-bold text-dark mb-4">{event.title}</h1>
              
              <h5 className="fw-bold text-dark mb-3">Mô tả chi tiết sự kiện</h5>
              <div className="text-dark fs-6" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {event.description}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm p-4 sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold mb-4 text-orange">Thông tin thời gian & địa điểm</h5>
            
            <div className="mb-4">
              <div className="text-muted small mb-1 d-flex align-items-center">
                <FaCalendarAlt className="me-2 text-primary" />
                <strong>Thời gian bắt đầu:</strong>
              </div>
              <div className="ps-4 text-dark fw-semibold">{formatDate(event.startDate)}</div>
            </div>

            <div className="mb-4">
              <div className="text-muted small mb-1 d-flex align-items-center">
                <FaCalendarAlt className="me-2 text-primary" />
                <strong>Thời gian kết thúc:</strong>
              </div>
              <div className="ps-4 text-dark fw-semibold">{formatDate(event.endDate)}</div>
            </div>

            <div className="mb-4">
              <div className="text-muted small mb-1 d-flex align-items-center">
                <FaMapMarkerAlt className="me-2 text-danger" />
                <strong>Địa điểm tổ chức:</strong>
              </div>
              <div className="ps-4 text-dark fw-semibold">{event.location}</div>
            </div>

            <div className="mb-4">
              <div className="text-muted small mb-1 d-flex align-items-center">
                <FaUsers className="me-2 text-success" />
                <strong>Ban tổ chức:</strong>
              </div>
              <div className="ps-4 text-dark fw-semibold">{event.clubName}</div>
            </div>

            {event.registrationLink ? (
              <Button
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                variant="warning"
                className="w-100 py-3 fw-bold text-dark d-flex align-items-center justify-content-center shadow-sm fs-5 mt-4 rounded-pill"
              >
                Đăng ký tham gia ngay <FaExternalLinkAlt className="ms-2" size={16} />
              </Button>
            ) : (
              <div className="alert alert-secondary text-center mb-0 mt-4 py-3 fw-semibold">
                Sự kiện này không yêu cầu đăng ký trước
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EventDetail;
