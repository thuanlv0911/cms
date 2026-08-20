import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Badge, Table, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaExternalLinkAlt, FaUserCircle } from 'react-icons/fa';

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
        const [clubRes, eventsRes, newsRes, membersRes] = await Promise.all([
          fetch(`http://localhost:5000/clubs/${id}`),
          fetch(`http://localhost:5000/events?clubId=${id}&status=approved`),
          fetch(`http://localhost:5000/news?clubId=${id}&status=approved`),
          fetch(`http://localhost:5000/club_members?clubId=${id}`)
        ]);

        if (clubRes.ok) {
          const clubData = await clubRes.json();
          setClub(clubData);
        }
        setEvents(await eventsRes.json());
        setNews(await newsRes.json());
        setMembers(await membersRes.json());
      } catch (error) {
        console.error('Lỗi khi tải thông tin CLB:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
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
      {/* Header CLB */}
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

      {/* Tabs nội dung */}
      <Tabs defaultActiveKey="news" id="club-detail-tabs" className="mb-4 fw-semibold">
        {/* Tab 1: Tin tức */}
        <Tab eventKey="news" title={`Tin tức (${news.length})`}>
          {news.length === 0 ? (
            <div className="text-center py-5 bg-white rounded shadow-sm">
              <p className="text-muted mb-0">Chưa có tin tức nào được đăng tải.</p>
            </div>
          ) : (
            <Row xs={1} md={2} className="g-4 mt-2">
              {news.map((item) => (
                <Col key={item.id}>
                  <Card className="h-100 border-0 shadow-sm p-4">
                    <Card.Body className="d-flex flex-column p-0">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="text-muted small">
                          Ngày đăng: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <Card.Title className="fw-bold fs-5 mb-3">{item.title}</Card.Title>
                      <Card.Text className="text-muted small flex-grow-1">
                        {item.content}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Tab>

        {/* Tab 2: Sự kiện */}
        <Tab eventKey="events" title={`Sự kiện (${events.length})`}>
          {events.length === 0 ? (
            <div className="text-center py-5 bg-white rounded shadow-sm">
              <p className="text-muted mb-0">Hiện chưa có sự kiện nào đang diễn ra hoặc sắp tới.</p>
            </div>
          ) : (
            <Row xs={1} md={2} className="g-4 mt-2">
              {events.map((event) => (
                <Col key={event.id}>
                  <Card className="h-100 border-0 shadow-sm overflow-hidden">
                    <div style={{ height: '180px', overflow: 'hidden' }}>
                      <img
                        src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop'}
                        alt={event.title}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    <Card.Body className="d-flex flex-column p-4">
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
                          className="mt-4 w-100 fw-semibold text-dark d-flex align-items-center justify-content-center btn-sm"
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
        </Tab>

        {/* Tab 3: Thành viên */}
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
