import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-light-orange text-dark py-5 mt-auto">
      <Container>
        <Row className="g-4">
          <Col md={5}>
            <div className="d-flex align-items-center mb-3">
              <img src="/images/logo_FPTU.svg" alt="Logo FPTU" height="35" className="me-2" />
            </div>
            <p className="text-muted small">
              Hệ thống Quản lý Câu lạc bộ FPT University (FPTU CMS) là nền tảng kết nối hoạt động, hỗ trợ quản trị, cộng tác thông tin hiệu quả giữa Phòng Công tác sinh viên (PDP) và Ban chủ nhiệm các câu lạc bộ tại trường.
            </p>
          </Col>

          <Col md={3} className="ms-md-auto">
            <h5 className="fw-bold mb-3 text-orange">Liên kết nhanh</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/clubs" className="text-decoration-none text-secondary hover-text-orange small">
                  Danh sách câu lạc bộ
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/events" className="text-decoration-none text-secondary hover-text-orange small">
                  Lịch trình sự kiện
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/news" className="text-decoration-none text-secondary hover-text-orange small">
                  Tin tức & Thông báo
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={4}>
            <h5 className="fw-bold mb-3 text-orange">Liên hệ bộ phận PDP</h5>
            <ul className="list-unstyled text-muted small">
              <li className="mb-2 d-flex align-items-start">
                <FaMapMarkerAlt className="me-2 mt-1 text-orange" />
                <span>Phòng Công tác sinh viên (PDP), Tòa Alpha, Khu công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaEnvelope className="me-2 text-orange" />
                <span>pdp.hl@fpt.edu.vn</span>
              </li>
              <li className="mb-0 d-flex align-items-center">
                <FaPhoneAlt className="me-2 text-orange" />
                <span>(024) 7300 1866</span>
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="my-4 border-secondary opacity-25" />

        <div className="text-center text-muted small">
          <p className="mb-0">&copy; {new Date().getFullYear()} FPT University. Bản quyền thuộc về phòng Công tác sinh viên PDP.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
