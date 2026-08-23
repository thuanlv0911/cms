import React from 'react';
import { Table, Badge, Card } from 'react-bootstrap';
import { FaUsers } from 'react-icons/fa';

const ClubTab = ({ members }) => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <h5 className="fw-bold mb-4 text-dark d-flex align-items-center">
          <FaUsers className="text-primary me-2" /> Danh sách thành viên Câu Lạc Bộ
        </h5>
        
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr>
                <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0', width: '80px' }}>STT</th>
                <th className="admin-table-header py-3 px-4">Mã sinh viên</th>
                <th className="admin-table-header py-3 px-4">Họ và tên</th>
                <th className="admin-table-header py-3 px-4">Email liên hệ</th>
                <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0', width: '180px' }}>Chức vụ</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, index) => (
                <tr key={m.id}>
                  <td className="py-3 px-4 fw-medium text-muted">{index + 1}</td>
                  <td className="py-3 px-4 fw-bold">{m.code || m.username.toUpperCase()}</td>
                  <td className="py-3 px-4">{m.fullName}</td>
                  <td className="py-3 px-4 text-muted">{m.email}</td>
                  <td className="py-3 px-4">
                    <Badge
                      bg={m.isPresident ? 'orange-subtle' : 'light'}
                      className={`${m.isPresident ? 'text-orange border border-orange-subtle' : 'text-secondary border'} px-3 py-2 fw-medium rounded-pill`}
                    >
                      {m.isPresident ? 'Chủ nhiệm CLB' : 'Thành viên'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ClubTab;
