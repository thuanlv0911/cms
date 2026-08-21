import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Carousel, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaExternalLinkAlt, FaRegClock, FaArrowRight } from 'react-icons/fa';
import { clubService, eventService, newsService } from '../services/api';

const BANNERS = [
  {
    image: '/images/banner_tetdangian.jpg',
    title: 'Chào mừng đến với FPTU CLB!',
    description: 'Nơi kết nối đam mê, phát triển kỹ năng và lưu giữ những kỷ niệm sinh viên tuyệt đẹp.'
  },
  {
    image: '/images/banner2.jpg',
    title: 'Sự kiện & Hoạt động hấp dẫn',
    description: 'Đừng bỏ lỡ các giải đấu kịch tính, workshop công nghệ và những đêm nhạc acoustic đỉnh cao.'
  }
];

const Homepage = () => {
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clubsData, eventsData, newsData] = await Promise.all([
          clubService.getAll(),
          eventService.getAllApproved(3),
          newsService.getAllApproved(3)
        ]);

        setClubs(clubsData.slice(0, 4));
        setEvents(eventsData);
        setNews(newsData);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    <div className="homepage-wrapper d-flex flex-column min-vh-100 bg-light">
      <section className="banner-section">
        <Carousel fade interval={5000} className="shadow-sm">
          {BANNERS.map((banner, index) => (
            <Carousel.Item key={index} style={{ height: '540px' }}>
              <img
                className="d-block w-100 h-100 object-fit-cover"
                src={banner.image}
                alt={banner.title}
                style={{ filter: 'brightness(60%)' }}
              />
              <Carousel.Caption className="text-start pb-5">
                <h1 className="display-4 fw-bold text-white mb-2">{banner.title}</h1>
                <p className="fs-5 text-light mb-4">{banner.description}</p>
                <Button as={Link} to="/clubs" variant="warning" className="fw-semibold px-4 py-2 text-dark rounded-pill">
                  Khám phá ngay
                </Button>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      <Container className="py-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-2 text-muted">Đang tải thông tin trang chủ...</p>
          </div>
        ) : (
          <>
            <section className="clubs-section mb-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="fw-bold text-dark mb-1">♣️ Câu lạc bộ Tiêu Biểu</h2>
                  <p className="text-muted mb-0">Khám phá cộng đồng học tập và giải trí năng động tại FPTU</p>
                </div>
                <Button as={Link} to="/clubs" variant="link" className="text-primary fw-semibold p-0 text-decoration-none d-flex align-items-center">
                  Xem tất cả CLB <FaArrowRight className="ms-1" size={14} />
                </Button>
              </div>

              <Row xs={1} md={2} lg={4} className="g-4">
                {clubs.map((club) => (
                  <Col key={club.id}>
                    <Card className="h-100 border-0 shadow-sm hover-shadow transition">
                      <Card.Body className="d-flex flex-column p-4">
                        <div className="fs-1 mb-3">{club.logo}</div>
                        <Card.Title className="fw-bold fs-5 mb-2">{club.name}</Card.Title>
                        <Badge bg="secondary" className="align-self-start mb-3 px-2 py-1">{club.category}</Badge>
                        <Card.Text className="text-muted small flex-grow-1">
                          {club.description.length > 90 ? `${club.description.substring(0, 90)}...` : club.description}
                        </Card.Text>
                        <Button as={Link} to={`/clubs/${club.id}`} variant="outline-dark" className="w-100 mt-3 rounded-pill btn-sm fw-semibold">
                          Xem chi tiết
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </section>

            <section className="events-section mb-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="fw-bold text-dark mb-1">📅 Sự kiện Sắp Diễn Ra</h2>
                  <p className="text-muted mb-0">Đăng ký tham gia để tích lũy trải nghiệm và điểm rèn luyện</p>
                </div>
                <Button as={Link} to="/events" variant="link" className="text-primary fw-semibold p-0 text-decoration-none d-flex align-items-center">
                  Xem tất cả sự kiện <FaArrowRight className="ms-1" size={14} />
                </Button>
              </div>

              {events.length === 0 ? (
                <Card className="text-center p-5 border-0 shadow-sm">
                  <Card.Body>
                    <p className="text-muted mb-0">Hiện tại chưa có sự kiện nào được công bố.</p>
                  </Card.Body>
                </Card>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
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
                          <Badge bg="info" className="align-self-start mb-2 px-2 py-1 text-dark fw-semibold">{event.clubName}</Badge>
                          <Card.Title className="fw-bold fs-5 mb-3">{event.title}</Card.Title>

                          <div className="text-muted small mb-2 d-flex align-items-center">
                            <FaCalendarAlt className="me-2 text-primary" />
                            {formatDate(event.startDate)}
                          </div>
                          <div className="text-muted small mb-3 d-flex align-items-center">
                            <FaMapMarkerAlt className="me-2 text-danger" />
                            {event.location}
                          </div>

                          <Card.Text className="text-muted small flex-grow-1 mb-4">
                            {event.description.length > 120 ? `${event.description.substring(0, 120)}...` : event.description}
                          </Card.Text>

                          <div className="mt-auto d-flex gap-2">
                            <Button as={Link} to={`/events/${event.id}`} variant="light" className="flex-fill fw-semibold btn-sm">
                              Chi tiết
                            </Button>
                            {event.registrationLink && (
                              <Button
                                href={event.registrationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="warning"
                                className="flex-fill fw-semibold btn-sm d-flex align-items-center justify-content-center text-dark"
                              >
                                Đăng ký <FaExternalLinkAlt className="ms-1" size={10} />
                              </Button>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </section>

            <section className="news-section mb-3">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="fw-bold text-dark mb-1">📰 Tin tức & Thông báo</h2>
                  <p className="text-muted mb-0">Cập nhật tin tức nóng hổi từ các câu lạc bộ</p>
                </div>
                <Button as={Link} to="/news" variant="link" className="text-primary fw-semibold p-0 text-decoration-none d-flex align-items-center">
                  Xem tất cả tin tức <FaArrowRight className="ms-1" size={14} />
                </Button>
              </div>

              {news.length === 0 ? (
                <Card className="text-center p-5 border-0 shadow-sm">
                  <Card.Body>
                    <p className="text-muted mb-0">Chưa có thông báo hoặc tin tức mới.</p>
                  </Card.Body>
                </Card>
              ) : (
                <Row xs={1} md={3} className="g-4">
                  {news.map((item) => (
                    <Col key={item.id}>
                      <Card className="h-100 border-0 shadow-sm p-4">
                        <Card.Body className="d-flex flex-column p-0">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <Badge bg="secondary">{item.clubName}</Badge>
                            <span className="text-muted small d-flex align-items-center">
                              <FaRegClock className="me-1" size={12} />
                              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <Card.Title className="fw-bold fs-5 mb-3 text-dark">{item.title}</Card.Title>
                          <Card.Text className="text-muted small flex-grow-1">
                            {item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content}
                          </Card.Text>
                          <Button as={Link} to={`/news/${item.id}`} variant="link" className="text-primary fw-semibold p-0 mt-3 align-self-start text-decoration-none d-flex align-items-center">
                            Đọc thêm <FaArrowRight className="ms-1" size={12} />
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </section>
          </>
        )}
      </Container>
    </div>
  );
};

export default Homepage;
