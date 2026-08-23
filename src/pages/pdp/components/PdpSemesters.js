import React, { useState } from 'react';
import { Card, Table, Button, Alert, Badge, Modal, Form } from 'react-bootstrap';
import { semesterService } from '../../../services/api';

const PdpSemesters = ({
  semesters = [],
  loading = false,
  error = '',
  fetchSemesters,
  getSemesterStatus
}) => {
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [semName, setSemName] = useState('');
  const [semStartDate, setSemStartDate] = useState('');
  const [semEndDate, setSemEndDate] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  const convertToDbDate = (inputDate) => {
    if (!inputDate) return '';
    const [year, month, day] = inputDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleOpenAddModal = () => {
    setSemName('');
    setSemEndDate('');
    setModalError('');
    setModalSuccess('');

    let latestSemester = null;
    let maxEndDateTime = 0;
    
    semesters.forEach(sem => {
      const endDateObj = parseDateStr(sem.endDate);
      if (endDateObj && endDateObj.getTime() > maxEndDateTime) {
        maxEndDateTime = endDateObj.getTime();
        latestSemester = sem;
      }
    });

    if (latestSemester) {
      const latestEndDate = parseDateStr(latestSemester.endDate);
      const expectedStartDate = new Date(latestEndDate);
      expectedStartDate.setDate(latestEndDate.getDate() + 1);
      
      const formatToInputDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setSemStartDate(formatToInputDate(expectedStartDate));
    } else {
      setSemStartDate('');
    }

    setShowSemesterModal(true);
  };

  const handleSaveSemester = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!semName.trim() || !semStartDate || !semEndDate) {
      setModalError('Vui lòng điền đầy đủ các trường thông tin!');
      return;
    }

    const start = new Date(semStartDate);
    const end = new Date(semEndDate);

    if (start >= end) {
      setModalError('Ngày bắt đầu phải trước ngày kết thúc!');
      return;
    }

    let latestSemester = null;
    let maxEndDateTime = 0;
    
    semesters.forEach(sem => {
      const endDateObj = parseDateStr(sem.endDate);
      if (endDateObj && endDateObj.getTime() > maxEndDateTime) {
        maxEndDateTime = endDateObj.getTime();
        latestSemester = sem;
      }
    });

    if (latestSemester) {
      const latestEndDate = parseDateStr(latestSemester.endDate);
      const expectedStartDate = new Date(latestEndDate);
      expectedStartDate.setDate(latestEndDate.getDate() + 1);
      
      const formatToInputDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const expectedStartDateStr = formatToInputDate(expectedStartDate);
      
      if (semStartDate !== expectedStartDateStr) {
        const day = String(expectedStartDate.getDate()).padStart(2, '0');
        const month = String(expectedStartDate.getMonth() + 1).padStart(2, '0');
        const year = expectedStartDate.getFullYear();
        const friendlyDate = `${day}/${month}/${year}`;
        
        setModalError(`Ngày bắt đầu phải sau 1 ngày so với ngày kết thúc học kỳ gần nhất (${latestSemester.name} kết thúc ngày ${latestSemester.endDate}). Ngày bắt đầu bắt buộc: ${friendlyDate}`);
        return;
      }
    }

    const isDuplicateName = semesters.some(s => 
      s.name.toLowerCase() === semName.trim().toLowerCase()
    );

    if (isDuplicateName) {
      setModalError('Tên học kỳ đã tồn tại!');
      return;
    }

    try {
      const semData = {
        name: semName.trim(),
        startDate: convertToDbDate(semStartDate),
        endDate: convertToDbDate(semEndDate)
      };

      await semesterService.create(semData);
      setModalSuccess('Thêm học kỳ mới thành công!');

      await fetchSemesters();
      setTimeout(() => {
        setShowSemesterModal(false);
      }, 1000);
    } catch (err) {
      console.error('Lỗi khi lưu học kỳ:', err);
      setModalError(err.message || 'Có lỗi xảy ra khi lưu học kỳ.');
    }
  };

  return (
    <div>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0 text-dark">Danh sách Học kỳ</h5>
            <Button 
              variant="primary" 
              className="fw-semibold px-3 py-2 btn-primary rounded-pill"
              onClick={handleOpenAddModal}
            >
              + Thêm học kỳ mới
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2 text-muted">Đang tải danh sách học kỳ...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tên học kỳ</th>
                    <th className="admin-table-header py-3 px-4">Thời gian bắt đầu</th>
                    <th className="admin-table-header py-3 px-4">Thời gian kết thúc</th>
                    <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {semesters.map((sem) => {
                    const status = getSemesterStatus(sem);
                    return (
                      <tr key={sem.id}>
                        <td className="fw-bold py-3 px-4">{sem.name}</td>
                        <td className="py-3 px-4">{sem.startDate}</td>
                        <td className="py-3 px-4">{sem.endDate}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            bg={status === 'Đang diễn ra' ? 'success' : status === 'Sắp diễn ra' ? 'info' : 'secondary'} 
                            className={`px-3 py-2 fw-medium rounded-pill ${status === 'Sắp diễn ra' ? 'text-dark' : ''}`}
                          >
                            {status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showSemesterModal} onHide={() => setShowSemesterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            Thêm Học Kỳ Mới
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveSemester}>
          <Modal.Body>
            {modalError && <Alert variant="danger">{modalError}</Alert>}
            {modalSuccess && <Alert variant="success">{modalSuccess}</Alert>}

            <Form.Group className="mb-3" controlId="formSemesterName">
              <Form.Label className="fw-semibold">Tên học kỳ</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ví dụ: Fall2026, Summer2026..."
                value={semName}
                onChange={(e) => setSemName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formSemesterStartDate">
              <Form.Label className="fw-semibold">Ngày bắt đầu</Form.Label>
              <Form.Control
                type="date"
                value={semStartDate}
                onChange={(e) => setSemStartDate(e.target.value)}
                required
                disabled={semesters.length > 0}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formSemesterEndDate">
              <Form.Label className="fw-semibold">Ngày kết thúc</Form.Label>
              <Form.Control
                type="date"
                value={semEndDate}
                onChange={(e) => setSemEndDate(e.target.value)}
                required
                min={semStartDate}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSemesterModal(false)} className="rounded-pill px-4">
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 btn-primary">
              Lưu học kỳ
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default PdpSemesters;
