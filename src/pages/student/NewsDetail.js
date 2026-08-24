import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaRegClock, FaArrowLeft } from 'react-icons/fa';
import { newsService, clubService } from '../../services/api';

const NewsDetail = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [club, setClub] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let newsDataFetched = null;
    newsService.getById(id)
      .then((newsData) => {
        newsDataFetched = newsData;
        setNewsItem(newsData);
        
        const promises = [];
        if (newsData.clubId) {
          promises.push(clubService.getById(newsData.clubId));
          promises.push(newsService.getByClub(newsData.clubId));
        } else {
          promises.push(Promise.resolve(null));
          promises.push(Promise.resolve([]));
        }
        return Promise.all(promises);
      })
      .then(([clubData, clubNews]) => {
        setClub(clubData);
        
        const otherNews = clubNews.filter(
          (n) => n.id !== newsDataFetched.id && n.status === 'approved'
        );
        
        const sorted = otherNews
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
          
        setRelatedNews(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết tin tức:', err);
        setLoading(false);
      });
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

  if (!newsItem) {
    return (
      <Container className="py-5 text-center">
        <h2>Không tìm thấy tin tức!</h2>
        <Button as={Link} to="/news" variant="primary" className="mt-3">
          Quay lại danh sách tin tức
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Button as={Link} to="/news" variant="outline-secondary" className="mb-4 d-inline-flex align-items-center rounded-pill">
        <FaArrowLeft className="me-2" /> Quay lại danh sách
      </Button>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm p-4 md-p-5 mb-4">
            <Card.Body className="p-0">
              {/* Tên tin tức */}
              <h1 className="fw-bold text-dark mb-4">{newsItem.title}</h1>

              {/* Ảnh bài viết */}
              <div className="mb-4 rounded-3 overflow-hidden" style={{ maxHeight: '450px' }}>
                <img
                  src={newsItem.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop'}
                  alt={newsItem.title}
                  className="w-100 object-fit-cover"
                  style={{ maxHeight: '450px' }}
                />
              </div>

              {/* Ngày đăng tải */}
              <div className="d-flex align-items-center mb-4 text-muted small">
                <FaRegClock className="me-2" />
                <span>Ngày đăng tải: {new Date(newsItem.createdAt).toLocaleString('vi-VN')}</span>
              </div>

              <hr className="my-4" />

              {/* Nội dung */}
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }} className="fs-5 text-dark">
                {newsItem.content}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <div className="sticky-top" style={{ top: '90px' }}>
            {/* Câu lạc bộ tổ chức */}
            {club && (
              <Card className="border-0 shadow-sm p-4 text-center mb-4 bg-white">
                <h6 className="fw-bold mb-3 text-muted">Câu lạc bộ đăng tin</h6>
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
                      src={club.image || `https://images.unsplash.com/photo-1560421683-6856ea585c78?w=600&auto=format&fit=crop`}
                      alt={club.name}
                      className="w-100 h-100 object-fit-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=600&auto=format&fit=crop';
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

            {/* Tin tức liên quan */}
            <Card className="border-0 shadow-sm p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">Tin tức liên quan</h5>
              {relatedNews.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {relatedNews.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`d-flex align-items-start pb-3 ${index < relatedNews.length - 1 ? 'border-bottom' : ''}`}
                    >
                      <div 
                        style={{ width: '80px', height: '60px', overflow: 'hidden', borderRadius: '8px' }} 
                        className="me-3 flex-shrink-0"
                      >
                        <img 
                          src={item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop'} 
                          alt={item.title} 
                          className="w-100 h-100 object-fit-cover" 
                        />
                      </div>
                      <div className="overflow-hidden">
                        <Link 
                          to={`/news/${item.id}`} 
                          className="text-dark fw-semibold text-decoration-none d-block small"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: '1.4'
                          }}
                        >
                          {item.title}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted italic small mb-0">Không có tin tức liên quan khác từ câu lạc bộ này.</p>
              )}
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NewsDetail;
