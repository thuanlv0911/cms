import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ClubCard = ({ club, truncate = false }) => {
  const navigate = useNavigate();
  const desc = truncate && club.description.length > 90 
    ? `${club.description.substring(0, 90)}...` 
    : club.description;

  const handleCardClick = () => {
    navigate(`/clubs/${club.id}`);
  };

  return (
    <Card 
      className="h-100 border-0 shadow-sm hover-shadow transition cursor-pointer"
      onClick={handleCardClick}
    >
      <Card.Body className="d-flex flex-column p-4">
        <div className="fs-1 mb-3">{club.logo}</div>
        <Card.Title className="fw-bold fs-5 mb-2">{club.name}</Card.Title>
        <Badge bg="secondary" className="align-self-start mb-3 px-2 py-1">{club.category}</Badge>
        <Card.Text className="text-muted small flex-grow-1">
          {desc}
        </Card.Text>
        <Button 
          variant="outline-dark" 
          className="w-100 mt-3 rounded-pill btn-sm fw-semibold"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/clubs/${club.id}`);
          }}
        >
          Xem chi tiết
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ClubCard;
