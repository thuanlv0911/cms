import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { newsService } from '../../services/api';
import NewsCard from '../../components/NewsCard';

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
              <NewsCard news={item} truncate={true} buttonStyle="outline" />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default NewsList;
