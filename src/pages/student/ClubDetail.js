import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Badge, Table, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
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
        <Button as={Link} to="/clubs" variant="primary" className="mt-3">Quay lại danh sách CLB</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm mb-4 p-4">
        <Card.Body className="d-flex align-items-center flex-wrap gap-4">
          <div className="fs-1 bg-light p-3 rounded shadow-sm">{club.logo}</div>
          <div>
            <Badge bg="secondary" className="mb-2 px-3 py-2 fs-6">{club.category}</Badge>
            <h1 className="fw-bold text-dark">{club.name}</h1>
            <p className="text-muted mb-0">{club.description}</p>
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

        <Tab eventKey="members" title={`Thành viên (${members.length})`}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Họ và tên</th>
                    <th>MSSV</th>
                    <th>Email</th>
                    <th>Vai trò trong CLB</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        Danh sách thành viên trống.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr key={member.id}>
                        <td className="fw-semibold">
                          <FaUserCircle className="text-secondary me-2" size={20} />
                          {member.fullName}
                        </td>
                        <td>{member.studentId}</td>
                        <td>{member.email}</td>
                        <td>
                          <Badge bg={member.role === 'Chủ nhiệm' ? 'danger' : 'primary'}>
                            {member.role}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default ClubDetail;
