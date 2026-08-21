import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Tabs, Tab } from 'react-bootstrap';
import { clubService } from '../../services/api';
import ClubCard from '../../components/ClubCard';

const ClubList = () => {
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
                        <ClubCard club={club} truncate={false} />
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

export default ClubList;
