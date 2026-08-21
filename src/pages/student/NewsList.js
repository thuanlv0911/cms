import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaRegClock } from 'react-icons/fa';
import { newsService } from '../../services/api';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsService.getAllApproved()
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải danh sách tin tức:', err);
        setLoading(false);
      });
  }, []);

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.clubName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">Tin tức & Thông báo</h1>
        <p className="text-muted">Cập nhật những hoạt động mới nhất, thông báo khẩn và bài viết nổi bật từ các câu lạc bộ</p>
      </div>

      <Row className="justify-content-center mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="🔍 Tìm kiếm tin tức, câu lạc bộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow-sm p-3 rounded-pill border-0"
          />
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm">
          <p className="text-muted fs-5 mb-0">Chưa có tin tức nào được công bố hoặc không tìm thấy kết quả phù hợp.</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredNews.map((item) => (
            <Col key={item.id}>
              <Card className="h-100 border-0 shadow-sm p-4 hover-shadow transition d-flex flex-column">
                <Card.Body className="d-flex flex-column p-0">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge bg="secondary" className="px-2 py-1">{item.clubName}</Badge>
                    <span className="text-muted small d-flex align-items-center">
                      <FaRegClock className="me-1" size={12} />
                      {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <Card.Title className="fw-bold fs-5 mb-3 text-dark">{item.title}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1">
                    {item.content.length > 180 ? `${item.content.substring(0, 180)}...` : item.content}
                  </Card.Text>
                  <Button 
                    as={Link}
                    to={`/news/${item.id}`}
                    variant="outline-primary" 
                    className="mt-4 w-100 rounded-pill btn-sm fw-semibold"
                  >
                    Xem chi tiết
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default NewsList;
