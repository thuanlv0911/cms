import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Tabs, Tab, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { clubService } from '../../services/api';

const BrowseClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clubService.getAll()
      .then((data) => {
        setClubs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi tải danh sách CLB:', err);
        setLoading(false);
      });
  }, []);

  const categories = ['Lĩnh vực khác', 'Thể thao', 'Học thuật', 'Nghệ thuật'];

  const getFilteredClubs = (category) => {
    return clubs.filter(
      (club) =>
        club.category === category &&
        club.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">Danh sách các Câu lạc bộ</h1>
        <p className="text-muted">Nơi hội tụ các tài năng, rèn luyện thể chất và phát triển tư duy học thuật tại FPTU</p>
      </div>

      <Row className="justify-content-center mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="🔍 Tìm kiếm câu lạc bộ theo tên..."
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
      ) : (
        <Tabs defaultActiveKey="Lĩnh vực khác" id="club-tabs" className="mb-4 justify-content-center fw-semibold custom-tabs">
          {categories.map((cat) => {
            const filtered = getFilteredClubs(cat);
            return (
              <Tab eventKey={cat} title={`${cat} (${filtered.length})`} key={cat}>
                <Row xs={1} md={2} lg={3} className="g-4 mt-2">
                  {filtered.length === 0 ? (
                    <Col xs={12} className="text-center py-5">
                      <p className="text-muted fs-5">Không tìm thấy câu lạc bộ nào phù hợp.</p>
                    </Col>
                  ) : (
                    filtered.map((club) => (
                      <Col key={club.id}>
                        <Card className="h-100 border-0 shadow-sm p-4 hover-shadow transition">
                          <Card.Body className="d-flex flex-column p-0">
                            <div className="fs-1 mb-3">{club.logo}</div>
                            <Card.Title className="fw-bold fs-5 mb-2">{club.name}</Card.Title>
                            <Card.Text className="text-muted small flex-grow-1">
                              {club.description}
                            </Card.Text>
                            <Button as={Link} to={`/clubs/${club.id}`} variant="outline-primary" className="mt-4 rounded-pill w-100 fw-semibold">
                              Xem chi tiết
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>
              </Tab>
            );
          })}
        </Tabs>
      )}
    </Container>
  );
};

export default BrowseClubs;
