import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { eventService } from '../../services/api';
import EventCard from '../../components/EventCard';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getAllApproved()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải lịch sự kiện:', err);
        setLoading(false);
      });
  }, []);

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
              <EventCard event={event} truncate={false} showDetailButton={false} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default EventList;
