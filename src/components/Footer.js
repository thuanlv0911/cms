import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-light-orange text-dark py-2 pt-4 mt-auto">
      <Container>
        <Row className="g-4">
          <Col md={5}>
            <div className="d-flex align-items-center mb-3">
              <img src="/images/logo_FPTU.svg" alt="Logo FPTU" height="35" className="me-2" />
            </div>
            <p className="text-muted small">
              Hệ thống Quản lý Câu lạc bộ FPT University (FPTU CMS) là nền tảng kết nối hoạt động, hỗ trợ quản trị, cộng tác thông tin hiệu quả giữa bộ phận PDP - Chương trình Phát triển Cá nhân FPTU Hà Nội và Ban chủ nhiệm các câu lạc bộ tại trường.
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
                <span>Khu Giáo dục và Đào tạo - Khu Công nghệ cao Hòa Lạc - Km29 Đại lộ Thăng Long, Xã Hòa Lạc, TP. Hà Nội</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <FaEnvelope className="me-2 text-orange" />
                <span>pdp.hn@fpt.edu.vn</span>
              </li>
              <li className="mb-0 d-flex align-items-center">
                <FaPhoneAlt className="me-2 text-orange" />
                <span>024 6680 5910</span>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
