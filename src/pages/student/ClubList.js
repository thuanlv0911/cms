import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Tabs, Tab, Pagination } from 'react-bootstrap';
import { clubService } from '../../services/api';
import ClubCard from '../../components/ClubCard';

const ClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activePage, setActivePage] = useState(1);

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

  const categories = ['Tất cả', 'Lĩnh vực khác', 'Thể thao', 'Học thuật', 'Nghệ thuật'];

  const getFilteredClubsList = (tab) => {
    if (tab === 'Tất cả') {
      return clubs.filter(club => club.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return clubs.filter(
      (club) =>
        club.category === tab &&
        club.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setActivePage(1);
  };

  const currentTabClubs = getFilteredClubsList(activeTab);
  const totalPages = Math.ceil(currentTabClubs.length / 6);
  const startIndex = (activePage - 1) * 6;
  const paginatedClubs = currentTabClubs.slice(startIndex, startIndex + 6);

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
            onChange={handleSearchChange}
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
        <Tabs 
          activeKey={activeTab} 
          onSelect={(k) => {
            setActiveTab(k);
            setActivePage(1);
          }}
          id="club-tabs" 
          className="mb-4 justify-content-center fw-semibold custom-tabs"
        >
          {categories.map((cat) => {
            const tabFiltered = getFilteredClubsList(cat);
            const isCurrentTab = cat === activeTab;
            const listToRender = isCurrentTab ? paginatedClubs : [];

            return (
              <Tab eventKey={cat} title={`${cat} (${tabFiltered.length})`} key={cat}>
                {isCurrentTab && (
                  <>
                    <Row xs={1} md={2} lg={3} className="g-4 mt-2">
                      {listToRender.length === 0 ? (
                        <Col xs={12} className="text-center py-5">
                          <p className="text-muted fs-5">Không tìm thấy câu lạc bộ nào phù hợp.</p>
                        </Col>
                      ) : (
                        listToRender.map((club) => (
                          <Col key={club.id}>
                            <ClubCard club={club} truncate={false} />
                          </Col>
                        ))
                      )}
                    </Row>
                    
                    {totalPages > 1 && (
                      <Pagination className="justify-content-center mt-5">
                        <Pagination.Prev disabled={activePage === 1} onClick={() => setActivePage(activePage - 1)} />
                        {[...Array(totalPages)].map((_, i) => (
                          <Pagination.Item 
                            key={i + 1} 
                            active={i + 1 === activePage} 
                            onClick={() => setActivePage(i + 1)}
                          >
                            {i + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next disabled={activePage === totalPages} onClick={() => setActivePage(activePage + 1)} />
                      </Pagination>
                    )}
                  </>
                )}
              </Tab>
            );
          })}
        </Tabs>
      )}
    </Container>
  );
};

export default ClubList;
