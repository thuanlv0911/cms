import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <Container className="text-center py-5 my-5">
      <span className="fs-1">⚠️</span>
      <h2 className="fw-bold mt-3">Truy cập bị từ chối!</h2>
      <p className="text-muted">Bạn không có quyền truy cập vào chức năng hoặc trang này.</p>
      <Button as={Link} to="/" variant="primary" className="mt-3">
        Quay lại Trang chủ
      </Button>
    </Container>
  );
};

export default Unauthorized;
