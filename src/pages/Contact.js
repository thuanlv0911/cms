import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook } from 'react-icons/fa';

const Contact = () => {
  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm overflow-hidden mb-4">
        <div className="position-relative">
          <img
            src="/images/pdp_banner.jpg"
            alt="PDP Cover"
            className="fb-cover"
          />
        </div>

        <Card.Body className="pb-4">
          <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-end fb-profile-section mb-4 text-center text-sm-start">
            <img
              src="/images/pdp_logo.jpg"
              alt="PDP Avatar"
              className="fb-avatar me-sm-4"
            />
            <div className="mt-3 mt-sm-0">
              <h2 className="fw-bold mb-1">PDP - Chương trình Phát triển Cá nhân FPTU Hà Nội</h2>
              <p className="text-muted mb-0">Trang thông tin chính thức bộ phận PDP FPT University Hà Nội</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm p-4">
            <Card.Body className="p-0">
              <h5 className="fw-bold mb-4">Chi tiết liên hệ</h5>
              <div className="small text-dark">
                <div className="mb-3 d-flex align-items-start">
                  <FaMapMarkerAlt className="text-primary me-3 mt-1" size={16} />
                  <span>Khu Giáo dục và Đào tạo - Khu Công nghệ cao Hòa Lạc - Km29 Đại lộ Thăng Long, Xã Hòa Lạc, TP. Hà Nội</span>
                </div>
                <div className="mb-3 d-flex align-items-center">
                  <FaEnvelope className="text-success me-3" size={16} />
                  <a href="mailto:pdp.hn@fpt.edu.vn" className="text-decoration-none text-dark">pdp.hn@fpt.edu.vn</a>
                </div>
                <div className="mb-3 d-flex align-items-center">
                  <FaPhoneAlt className="text-danger me-3" size={16} />
                  <a href="tel:02466805910" className="text-decoration-none text-dark">024 6680 5910</a>
                </div>
                <div className="d-flex align-items-center">
                  <FaFacebook className="text-primary me-3" size={16} />
                  <a href="https://www.facebook.com/pdp.hn" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-primary fw-semibold">
                    facebook.com/pdp.hn
                  </a>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm p-4 h-100">
            <Card.Body className="p-0">
              <h5 className="fw-bold mb-4">Giới thiệu</h5>
              <p className="text-dark mb-0 fs-6" style={{ lineHeight: '1.8' }}>
                Chương trình Phát triển Cá nhân (PDP - Personal Development Program) là đội ngũ kiến tạo môi trường trải nghiệm năng động cho sinh viên Trường Đại học FPT Hà Nội, thông qua 3 trụ cột: Câu lạc bộ, Sự kiện và Khóa học.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
