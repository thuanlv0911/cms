import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { FaRegClock, FaArrowLeft, FaNewspaper } from 'react-icons/fa';
import { newsService } from '../../services/api';

const NewsDetail = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsService.getById(id)
      .then((data) => {
        setNewsItem(data);
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

      <Card className="border-0 shadow-sm p-4 md-p-5">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <Badge bg="secondary" className="fs-6 px-3 py-2">
              {newsItem.clubName}
            </Badge>
            <span className="text-muted d-flex align-items-center">
              <FaRegClock className="me-2" />
              {new Date(newsItem.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>

          <h1 className="fw-bold text-dark mb-4">{newsItem.title}</h1>
          <hr className="my-4" />

          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }} className="fs-5 text-dark">
            {newsItem.content}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NewsDetail;
