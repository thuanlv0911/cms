import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto border-top">
      <Container className="text-center">
        <p className="mb-1 fw-semibold">Hệ thống Quản lý Câu lạc bộ FPT University (FPTU CMS)</p>
        <p className="mb-0 text-muted small">
          &copy; {new Date().getFullYear()} FPT University. Thiết kế cho việc tương tác giữa PDP và Câu lạc bộ.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
