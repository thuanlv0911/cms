import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt } from 'react-icons/fa';

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
      className="h-100 border-0 shadow-sm hover-shadow transition cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <div style={{ height: '180px', overflow: 'hidden' }}>
        <img
          src={club.image || `/images/clubs/${club.id}.jpg`}
          alt={club.name}
          className="w-100 h-100 object-fit-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop';
          }}
        />
      </div>
      
      <Card.Body className="d-flex flex-column p-4">
        <Badge bg="secondary" className="align-self-start mb-2 px-2 py-1">{club.category}</Badge>
        <Card.Title className="fw-bold fs-5 mb-2">{club.name}</Card.Title>
        
        {club.foundedDate && (
          <div className="text-muted small mb-3 d-flex align-items-center">
            <FaCalendarAlt className="me-2 text-primary" size={12} />
            <span>Ngày thành lập: {club.foundedDate}</span>
          </div>
        )}
        
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
