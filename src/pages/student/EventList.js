import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Pagination } from 'react-bootstrap';
import { eventService } from '../../services/api';
import EventCard from '../../components/EventCard';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [sortOrder, setSortOrder] = useState('early');

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

  const getSortedEvents = () => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.startDate || 0);
      const dateB = new Date(b.startDate || 0);
      if (sortOrder === 'early') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  };

  const sortedEvents = getSortedEvents();
  const totalPages = Math.ceil(sortedEvents.length / 6);
  const startIndex = (activePage - 1) * 6;
  const paginatedEvents = sortedEvents.slice(startIndex, startIndex + 6);

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
        <>
          <Row className="justify-content-end mb-4">
            <Col xs="auto">
              <Form.Group className="d-flex align-items-center gap-2">
                <Form.Label className="mb-0 text-nowrap fw-semibold text-muted">Sắp xếp:</Form.Label>
                <Form.Select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setActivePage(1);
                  }}
                  className="shadow-sm border-0 bg-white p-2 rounded"
                  style={{ width: 'auto', minWidth: '140px' }}
                >
                  <option value="early">Sớm nhất</option>
                  <option value="late">Muộn nhất</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row xs={1} md={2} lg={3} className="g-4">
            {paginatedEvents.map((event) => (
              <Col key={event.id}>
                <EventCard event={event} truncate={false} showDetailButton={false} />
              </Col>
            ))}
          </Row>

          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-5">
              <Pagination.Prev disabled={activePage === 1} onClick={() => setActivePage(activePage - 1)} />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === activePage}
                  onClick={() => setActivePage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next disabled={activePage === totalPages} onClick={() => setActivePage(activePage + 1)} />
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default EventList;
