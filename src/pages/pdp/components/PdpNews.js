import React from 'react';
import { Card, Table, Alert, Badge } from 'react-bootstrap';

const PdpNews = () => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4 text-dark">Duyệt & Quản lý Tin tức</h5>
        <Alert variant="warning" className="mb-4">
          <strong>Tính năng Quản lý Tin tức:</strong> Phê duyệt các bài viết tin tức, thông báo nội bộ từ các CLB trước khi công bố lên trang tin chính thức của trường.
        </Alert>
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr>
                <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tiêu đề tin tức</th>
                <th className="admin-table-header py-3 px-4">Câu Lạc Bộ</th>
                <th className="admin-table-header py-3 px-4">Ngày gửi</th>
                <th className="admin-table-header py-3 px-4">Học kỳ</th>
                <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-bold py-3 px-4">Cập nhật nội quy phòng sinh hoạt CLB từ kỳ Fall 2026</td>
                <td className="py-3 px-4">FPTU BoardGame Club</td>
                <td className="py-3 px-4">20/08/2026</td>
                <td className="py-3 px-4"><Badge bg="light" className="text-dark border">Fall2026</Badge></td>
                <td className="py-3 px-4">
                  <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Đang chờ duyệt</Badge>
                </td>
              </tr>
              <tr>
                <td className="fw-bold py-3 px-4">Thông báo Tuyển Thành Viên Thế Hệ Mới Mùa Thu 2026</td>
                <td className="py-3 px-4">FPTU BoardGame Club</td>
                <td className="py-3 px-4">20/08/2026</td>
                <td className="py-3 px-4"><Badge bg="light" className="text-dark border">Summer2026</Badge></td>
                <td className="py-3 px-4">
                  <Badge bg="success" className="px-3 py-2 fw-medium rounded-pill">Đã duyệt</Badge>
                </td>
              </tr>
              <tr>
                <td className="fw-bold py-3 px-4">Khai giảng Câu lạc bộ Tiếng Anh đàm thoại định kỳ tuần này</td>
                <td className="py-3 px-4">FEC - FPTU English Club</td>
                <td className="py-3 px-4">19/08/2026</td>
                <td className="py-3 px-4"><Badge bg="light" className="text-dark border">Summer2026</Badge></td>
                <td className="py-3 px-4">
                  <Badge bg="success" className="px-3 py-2 fw-medium rounded-pill">Đã duyệt</Badge>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PdpNews;
