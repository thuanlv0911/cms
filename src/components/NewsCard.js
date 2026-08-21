import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaRegClock, FaArrowRight } from 'react-icons/fa';

const NewsCard = ({ news, truncate = false, buttonStyle = "link" }) => {
  const navigate = useNavigate();

  const desc = truncate && news.content.length > 150
    ? `${news.content.substring(0, 150)}...`
    : news.content;

  const handleCardClick = () => {
    navigate(`/news/${news.id}`);
  };

  return (
    <Card 
      className="h-100 border-0 shadow-sm p-4 hover-shadow transition d-flex flex-column cursor-pointer"
      onClick={handleCardClick}
    >
      <Card.Body className="d-flex flex-column p-0">
        <div className="d-flex justify-content-between align-items-center mb-3">
          {news.clubName && <Badge bg="secondary" className="me-2">{news.clubName}</Badge>}
          <span className="text-muted small d-flex align-items-center ms-auto">
            <FaRegClock className="me-1" size={12} />
            {new Date(news.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <Card.Title className="fw-bold fs-5 mb-3 text-dark">{news.title}</Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {desc}
        </Card.Text>
        
        {buttonStyle === "link" && (
          <Button
            variant="link"
            className="text-primary fw-semibold p-0 mt-3 align-self-start text-decoration-none d-flex align-items-center"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/news/${news.id}`);
            }}
          >
            Đọc thêm <FaArrowRight className="ms-1" size={12} />
          </Button>
        )}
        
        {buttonStyle === "outline" && (
          <Button
            variant="outline-primary"
            className="mt-4 w-100 rounded-pill btn-sm fw-semibold"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/news/${news.id}`);
            }}
          >
            Xem chi tiết
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default NewsCard;
