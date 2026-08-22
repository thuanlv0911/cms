import React, { useState, useEffect } from 'react';
import { Container, Card, Tabs, Tab, Badge, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';
import { clubService, eventService, newsService } from '../../services/api';
import EventCard from '../../components/EventCard';
import NewsCard from '../../components/NewsCard';

const ClubDetail = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const [clubData, eventsData, newsData, membersData] = await Promise.all([
          clubService.getById(id),
          eventService.getByClub(id).then(events => events.filter(e => e.status === 'approved')),
          newsService.getByClub(id).then(news => news.filter(n => n.status === 'approved')),
          clubService.getMembers(id)
        ]);

        setClub(clubData);
        setEvents(eventsData);
        setNews(newsData);
        setMembers(membersData);
      } catch (error) {
        console.error('Lỗi khi tải thông tin CLB:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </Container>
    );
  }

  if (!club) {
    return (
      <Container className="py-5 text-center">
        <h2>Không tìm thấy Câu lạc bộ!</h2>
      </Container>
    );
  }

  const president = members.find(m => m.isPresident === true);

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm mb-4 overflow-hidden bg-white">
        <Card.Body className="p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4">
            <div className="flex-shrink-0 shadow-sm border" style={{ width: '200px', height: '200px', overflow: 'hidden', borderRadius: '16px' }}>
              <img 
                src={club.image || `/images/clubs/${club.id}.jpg`} 
                alt={club.name}
                className="w-100 h-100 object-fit-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop';
                }}
              />
            </div>
            
            <div className="text-center text-md-start">
              <h1 className="fw-bold text-dark mb-2 display-6">{club.name}</h1>
              
              <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start align-items-center mb-3">
                <Badge bg="secondary" className="px-3 py-2 fw-semibold">
                  {club.category}
                </Badge>
                {club.foundedDate && (
                  <span className="text-muted small border px-3 py-1.5 rounded-pill bg-light d-inline-flex align-items-center">
                    <FaCalendarAlt className="me-2 text-primary" size={12} />
                    Ngày thành lập: {club.foundedDate}
                  </span>
                )}
              </div>

              {president && (
                <div className="bg-light p-3 rounded-3 mb-3 d-inline-block text-start w-100 w-md-auto border border-light">
                  <span className="text-muted small d-block">Chủ nhiệm câu lạc bộ</span>
                  <span className="fw-semibold text-dark fs-6">{president.fullName}</span>
                  <span className="text-muted small ms-2">({president.email})</span>
                </div>
              )}
              
              <p className="text-muted fs-6 mb-0 mt-3" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                {club.description}
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Tabs defaultActiveKey="news" id="club-detail-tabs" className="mb-4 fw-semibold">
        <Tab eventKey="news" title={`Tin tức (${news.length})`}>
          {news.length === 0 ? (
            <div className="text-center py-5 bg-white rounded shadow-sm">
              <p className="text-muted mb-0">Chưa có tin tức nào được đăng tải.</p>
            </div>
          ) : (
            <Row xs={1} md={2} className="g-4 mt-2">
              {news.map((item) => (
                <Col key={item.id}>
                  <NewsCard news={item} truncate={false} buttonStyle="none" />
                </Col>
              ))}
            </Row>
          )}
        </Tab>

        <Tab eventKey="events" title={`Sự kiện (${events.length})`}>
          {events.length === 0 ? (
            <div className="text-center py-5 bg-white rounded shadow-sm">
              <p className="text-muted mb-0">Hiện chưa có sự kiện nào đang diễn ra hoặc sắp tới.</p>
            </div>
          ) : (
            <Row xs={1} md={2} className="g-4 mt-2">
              {events.map((event) => (
                <Col key={event.id}>
                  <EventCard event={event} truncate={false} showDetailButton={false} />
                </Col>
              ))}
            </Row>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ClubDetail;
