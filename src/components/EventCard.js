import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

const EventCard = ({ event, truncate = false, showDetailButton = false }) => {
  const navigate = useNavigate();

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

  const desc = truncate && event.description.length > 120
    ? `${event.description.substring(0, 120)}...`
    : event.description;

  const handleCardClick = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <Card 
      className="h-100 border-0 shadow-sm overflow-hidden hover-shadow transition cursor-pointer"
      onClick={handleCardClick}
    >
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
          {desc}
        </Card.Text>
        
        <div className="mt-auto d-flex gap-2">
          {showDetailButton && (
            <Button 
              variant="light" 
              className="flex-fill fw-semibold btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/events/${event.id}`);
              }}
            >
              Chi tiết
            </Button>
          )}
          {event.registrationLink && (
            <Button
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              variant="warning"
              className="flex-fill fw-semibold btn-sm d-flex align-items-center justify-content-center text-dark"
              onClick={(e) => e.stopPropagation()}
            >
              Đăng ký <FaExternalLinkAlt className="ms-1" size={10} />
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default EventCard;
