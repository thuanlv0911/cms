import React, { useState } from 'react';
import { Card, Button, Table, Badge } from 'react-bootstrap';
import { FaPlus, FaCalendarAlt } from 'react-icons/fa';
import EventWizard from './EventWizard';
import { eventService } from '../../../services/api';

const EventTab = ({
  events,
  clubInfo,
  currentUser,
  isCreatingEvent,
  setIsCreatingEvent,
  onSubmitSuccess,
  onRefresh,
  loading
}) => {
  const [editingEvent, setEditingEvent] = useState(null);
  const [editMode, setEditMode] = useState('full'); // 'full' or 'slot_only'

  const formatEventTimeRange = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return { timeRange: '', dateStr: '' };
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    const startHours = start.getHours().toString().padStart(2, '0');
    const startMinutes = start.getMinutes().toString().padStart(2, '0');
    const endHours = end.getHours().toString().padStart(2, '0');
    const endMinutes = end.getMinutes().toString().padStart(2, '0');
    
    const startDay = start.getDate().toString().padStart(2, '0');
    const startMonth = (start.getMonth() + 1).toString().padStart(2, '0');
    const startYear = start.getFullYear();

    const timeRange = `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
    const dateStr = `${startDay}/${startMonth}/${startYear}`;

    return { timeRange, dateStr };
  };

  const getDefenseSlotBadge = (event) => {
    if (!event.defenseSlot) return <span className="text-muted">-</span>;

    const { dateStr, slot, timeRange } = event.defenseSlot;
    const status = event.status;

    let badgeClass = 'px-3 py-1.5 fw-medium rounded-pill fs-7 border ';
    let badgeBg = '';

    if (status === 'approved' || status === 'approved_to_defend') {
      badgeBg = 'success-subtle';
      badgeClass += 'text-success border-success-subtle';
    } else if (status === 'rejected_final' || status === 'rejected' || status === 'rejected_content') {
      badgeBg = 'danger-subtle';
      badgeClass += 'text-danger border-danger-subtle';
    } else if (status === 'rejected_slot') {
      badgeBg = 'warning-subtle';
      badgeClass += 'text-warning border-warning-subtle';
    } else {
      badgeBg = 'warning-subtle';
      badgeClass += 'text-warning border-warning-subtle';
    }

    return (
      <div>
        <div className="fw-semibold text-dark small mb-1">{dateStr}</div>
        <Badge bg={badgeBg} className={badgeClass}>
          Slot {slot} ({timeRange})
        </Badge>
      </div>
    );
  };

  const getPublishStatusBadge = (status) => {
    if (status === 'approved') {
      return (
        <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-medium rounded-pill fs-7">
          Đã duyệt tổng
        </Badge>
      );
    }
    if (status === 'approved_to_defend') {
      return (
        <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-3 py-2 fw-medium rounded-pill fs-7">
          Duyệt bảo vệ
        </Badge>
      );
    }
    if (status === 'rejected_slot') {
      return (
        <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-medium rounded-pill fs-7">
          Từ chối (Đổi lịch)
        </Badge>
      );
    }
    if (status === 'rejected_content') {
      return (
        <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 fw-medium rounded-pill fs-7">
          Từ chối (Sửa ND)
        </Badge>
      );
    }
    if (status === 'rejected_final' || status === 'rejected') {
      return (
        <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 fw-medium rounded-pill fs-7">
          Từ chối hoàn toàn
        </Badge>
      );
    }
    return (
      <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-medium rounded-pill fs-7">
        Chờ duyệt
      </Badge>
    );
  };

  const handleStartEdit = (event, mode) => {
    setEditingEvent(event);
    setEditMode(mode);
  };

  const handleEditSubmit = async (payload) => {
    try {
      // resubmitted events go back to pending
      await eventService.update(editingEvent.id, {
        ...payload,
        status: 'pending',
        pdpFeedback: ''
      });
      setEditingEvent(null);
      if (onRefresh) {
        await onRefresh();
      } else {
        onSubmitSuccess();
      }
      alert('Đã gửi lại yêu cầu phê duyệt sự kiện thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật sự kiện:', err);
      alert('Có lỗi xảy ra: ' + err.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này không?')) {
      try {
        await eventService.delete(eventId);
        if (onRefresh) {
          await onRefresh();
        } else {
          onSubmitSuccess();
        }
        alert('Đã xóa sự kiện thành công!');
      } catch (err) {
        console.error('Lỗi khi xóa sự kiện:', err);
        alert('Không thể xóa sự kiện.');
      }
    }
  };

  const getActions = (event) => {
    const status = event.status;
    if (status === 'rejected_slot') {
      return (
        <Button 
          variant="warning" 
          size="sm" 
          className="rounded-pill px-3 fw-semibold text-white btn-sm"
          onClick={() => handleStartEdit(event, 'slot_only')}
        >
          Đổi lịch bảo vệ
        </Button>
      );
    }
    if (status === 'rejected_content') {
      return (
        <Button 
          variant="primary" 
          size="sm" 
          className="rounded-pill px-3 fw-semibold btn-sm"
          onClick={() => handleStartEdit(event, 'full')}
        >
          Sửa nội dung
        </Button>
      );
    }
    if (status === 'rejected_final' || status === 'rejected') {
      return (
        <Button 
          variant="outline-danger" 
          size="sm" 
          className="rounded-pill px-3 fw-semibold btn-sm"
          onClick={() => handleDeleteEvent(event.id)}
        >
          Xóa
        </Button>
      );
    }
    return <span className="text-muted small">-</span>;
  };

  if (isCreatingEvent || editingEvent) {
    return (
      <EventWizard
        clubInfo={clubInfo}
        currentUser={currentUser}
        onCancel={() => {
          setIsCreatingEvent(false);
          setEditingEvent(null);
        }}
        onSubmit={editingEvent ? handleEditSubmit : onSubmitSuccess}
        loading={loading}
        eventToEdit={editingEvent}
        editMode={editMode}
      />
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0 text-dark">Danh sách sự kiện Câu Lạc Bộ</h5>
          <Button
            variant="primary"
            className="btn-primary rounded-pill d-flex align-items-center px-4"
            onClick={() => setIsCreatingEvent(true)}
          >
            <FaPlus className="me-2" size={12} /> Tạo Sự Kiện
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-5 text-muted">
            Câu lạc bộ chưa đăng ký sự kiện nào. Bấm nút "+ Tạo Sự Kiện" để bắt đầu!
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tên Sự Kiện</th>
                  <th className="admin-table-header py-3 px-4">Thời gian tổ chức</th>
                  <th className="admin-table-header py-3 px-4">Địa điểm</th>
                  <th className="admin-table-header py-3 px-4" style={{ width: '220px' }}>Lịch bảo vệ đề án</th>
                  <th className="admin-table-header py-3 px-4" style={{ width: '150px' }}>Trạng thái</th>
                  <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0', width: '180px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const { timeRange, dateStr } = formatEventTimeRange(e.startDate, e.endDate);
                  return (
                    <tr key={e.id}>
                      <td className="py-3 px-4">
                        <div className="fw-bold text-dark">{e.title}</div>
                        {e.pdpFeedback && (e.status === 'rejected_slot' || e.status === 'rejected_content' || e.status === 'rejected_final' || e.status === 'rejected') && (
                          <div className="text-danger small mt-1 italic">
                            <strong>Lý do từ chối:</strong> {e.pdpFeedback}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="fw-semibold text-dark small">{timeRange}</div>
                          <div className="text-muted small">{dateStr}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 fw-medium text-dark">{e.location}</td>
                      <td className="py-3 px-4">
                        {getDefenseSlotBadge(e)}
                      </td>
                      <td className="py-3 px-4">
                        {getPublishStatusBadge(e.status)}
                      </td>
                      <td className="py-3 px-4">
                        {getActions(e)}
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
  );
};

export default EventTab;
export { FaCalendarAlt };
