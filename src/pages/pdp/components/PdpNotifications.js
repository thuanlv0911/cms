import React from 'react';
import { Card, Table, Alert, Button } from 'react-bootstrap';

const PdpNotifications = () => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0 text-dark">Danh sách Thông báo hệ thống</h5>
          <Button variant="primary" className="fw-semibold px-3 py-2 btn-primary rounded-pill">
            + Gửi thông báo mới
          </Button>
        </div>
        <Alert variant="warning" className="mb-4">
          <strong>Tính năng Thông báo:</strong> Cho phép cán bộ gửi thông điệp trực tiếp tới hòm thư hoặc bảng tin của các Chủ nhiệm CLB và Sinh viên toàn trường.
        </Alert>
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr>
                <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tiêu đề thông báo</th>
                <th className="admin-table-header py-3 px-4">Đối tượng nhận</th>
                <th className="admin-table-header py-3 px-4">Người gửi</th>
                <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0' }}>Ngày gửi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-bold py-3 px-4">Yêu cầu hoàn thành Báo cáo sự kiện Tháng 8/2026</td>
                <td className="py-3 px-4">Tất cả Chủ nhiệm CLB</td>
                <td className="py-3 px-4">Phòng PDP</td>
                <td className="py-3 px-4">22/08/2026</td>
              </tr>
              <tr>
                <td className="fw-bold py-3 px-4">Lịch đăng ký gian hàng Câu lạc bộ tại ngày hội Club Day Fall 2026</td>
                <td className="py-3 px-4">Tất cả CLB</td>
                <td className="py-3 px-4">Phòng PDP</td>
                <td className="py-3 px-4">18/08/2026</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PdpNotifications;
