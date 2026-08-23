import React from 'react';
import { Card, Table, Alert, Badge } from 'react-bootstrap';

const PdpReports = () => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4 text-dark">Danh sách Báo cáo Hậu Sự kiện</h5>
        <Alert variant="warning" className="mb-4">
          <strong>Tính năng Duyệt Báo cáo:</strong> Cho phép cán bộ xem báo cáo tổng kết (số lượng người tham gia, hình ảnh, tài chính...) sau sự kiện từ các CLB nộp lên để tiến hành nghiệm thu và đánh giá.
        </Alert>
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr>
                <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tên Sự Kiện</th>
                <th className="admin-table-header py-3 px-4">Câu Lạc Bộ</th>
                <th className="admin-table-header py-3 px-4">Ngày nộp báo cáo</th>
                <th className="admin-table-header py-3 px-4">Học kỳ</th>
                <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-bold py-3 px-4">Báo cáo: Giải đấu Ma Sói Mùa Thu 2026</td>
                <td className="py-3 px-4">FPTU BoardGame Club</td>
                <td className="py-3 px-4">02/09/2026</td>
                <td className="py-3 px-4"><Badge bg="light" className="text-dark border">Summer2026</Badge></td>
                <td className="py-3 px-4">
                  <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Đang chờ duyệt</Badge>
                </td>
              </tr>
              <tr>
                <td className="fw-bold py-3 px-4">Báo cáo: Workshop Ứng dụng Generative AI</td>
                <td className="py-3 px-4">FPTU AI Club</td>
                <td className="py-3 px-4">07/09/2026</td>
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

export default PdpReports;
