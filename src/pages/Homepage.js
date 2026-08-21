import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Carousel, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { clubService, eventService, newsService } from '../services/api';
import ClubCard from '../components/ClubCard';
import EventCard from '../components/EventCard';
import NewsCard from '../components/NewsCard';

const BANNERS = [
  {
    image: '/images/banner_tetdangian.jpg',
    title: 'WELCOME TO FPTU CLUB!',
    description: 'Nơi kết nối đam mê, phát triển kỹ năng và lưu giữ những kỷ niệm sinh viên tuyệt đẹp.'
  },
  {
    image: '/images/banner2.jpg',
    title: 'Sự kiện & Hoạt động',
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

        const featuredClubs = [];
        const categories = ['Lĩnh vực khác', 'Thể thao', 'Học thuật', 'Nghệ thuật'];
        categories.forEach(cat => {
          const clubInCat = clubsData.find(c => c.category === cat);
          if (clubInCat) {
            featuredClubs.push(clubInCat);
          }
        });

        setClubs(featuredClubs);
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

  return (
    <div className="homepage-wrapper d-flex flex-column min-vh-100 bg-light">
      <section className="banner-section">
        <Carousel fade interval={5000} className="shadow-sm">
          {BANNERS.map((banner, index) => (
            <Carousel.Item key={index} style={{ height: '580px' }}>
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
                  <h2 className="fw-bold text-dark mb-1">Câu lạc bộ Tiêu Biểu</h2>
                  <p className="text-muted mb-0">Khám phá cộng đồng học tập và giải trí năng động tại FPTU</p>
                </div>
                <Button as={Link} to="/clubs" variant="link" className="text-primary fw-semibold p-0 text-decoration-none d-flex align-items-center">
                  Xem tất cả CLB
                </Button>
              </div>
              
              <Row xs={1} md={2} lg={4} className="g-4">
                {clubs.map((club) => (
                  <Col key={club.id}>
                    <ClubCard club={club} truncate={true} />
                  </Col>
                ))}
              </Row>
            </section>

            <section className="events-section mb-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="fw-bold text-dark mb-1">Sự kiện Sắp Diễn Ra</h2>
                  <p className="text-muted mb-0">Đăng ký tham gia để tích lũy trải nghiệm</p>
                </div>
                <Button as={Link} to="/events" variant="link" className="text-primary fw-semibold p-0 text-decoration-none d-flex align-items-center">
                  Xem tất cả sự kiện
                </Button>
              </div>

              {events.length === 0 ? (
                <div className="text-center p-5 bg-white shadow-sm rounded">
                  <p className="text-muted mb-0">Hiện tại chưa có sự kiện nào được công bố.</p>
                </div>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {events.map((event) => (
                    <Col key={event.id}>
                      <EventCard event={event} truncate={true} showDetailButton={true} />
                    </Col>
                  ))}
                </Row>
              )}
            </section>

            <section className="news-section mb-3">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="fw-bold text-dark mb-1">Tin tức & Thông báo</h2>
                  <p className="text-muted mb-0">Cập nhật tin tức nóng hổi từ các câu lạc bộ</p>
                </div>
                <Button as={Link} to="/news" variant="link" className="text-primary fw-semibold p-0 text-decoration-none d-flex align-items-center">
                  Xem tất cả tin tức
                </Button>
              </div>

              {news.length === 0 ? (
                <div className="text-center p-5 bg-white shadow-sm rounded">
                  <p className="text-muted mb-0">Chưa có thông báo hoặc tin tức mới.</p>
                </div>
              ) : (
                <Row xs={1} md={3} className="g-4">
                  {news.map((item) => (
                    <Col key={item.id}>
                      <NewsCard news={item} truncate={true} buttonStyle="link" />
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
