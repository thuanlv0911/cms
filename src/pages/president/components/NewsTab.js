import React, { useState } from 'react';
import { Card, Button, Table, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { newsService } from '../../../services/api';

const NewsTab = ({ news, clubInfo, currentUser, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedNews, setSelectedNews] = useState(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedNews(null);
    setTitle('');
    setImage('');
    setContent('');
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setModalType('edit');
    setSelectedNews(item);
    setTitle(item.title);
    setImage(item.image || '');
    setContent(item.content);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !image.trim() || !content.trim()) {
      setError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    try {
      setLoading(true);
      if (modalType === 'create') {
        const payload = {
          title: title.trim(),
          image: image.trim(),
          content: content.trim(),
          clubId: currentUser.clubId,
          clubName: clubInfo?.name || currentUser.clubName || ''
        };
        await newsService.create(payload);
        alert('Tạo tin tức và gửi yêu cầu phê duyệt thành công!');
      } else {
        const payload = {
          title: title.trim(),
          image: image.trim(),
          content: content.trim(),
          status: 'pending',
          pdpFeedback: ''
        };
        await newsService.update(selectedNews.id, payload);
        alert('Cập nhật tin tức thành công! Tin tức đã được chuyển sang trạng thái chờ duyệt lại.');
      }
      setShowModal(false);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error('Lỗi khi lưu tin tức:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu tin tức.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, titleText) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tin tức "${titleText}"?`)) {
      try {
        setLoading(true);
        await newsService.delete(id);
        alert('Đã xóa tin tức thành công!');
        if (onRefresh) {
          await onRefresh();
        }
      } catch (err) {
        console.error('Lỗi khi xóa tin tức:', err);
        alert(err.message || 'Có lỗi xảy ra khi xóa tin tức.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') {
      return (
        <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-medium rounded-pill fs-7">
          Đã duyệt
        </Badge>
      );
    }
    if (status === 'rejected') {
      return (
        <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 fw-medium rounded-pill fs-7">
          Từ chối
        </Badge>
      );
    }
    return (
      <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-medium rounded-pill fs-7">
        Chờ duyệt
      </Badge>
    );
  };

  return (
    <div>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0 text-dark">Danh sách tin tức của Câu Lạc Bộ</h5>
            <Button
              variant="primary"
              className="btn-primary rounded-pill d-flex align-items-center px-4"
              onClick={handleOpenCreate}
            >
              <FaPlus className="me-2" size={12} /> Tạo Tin Tức
            </Button>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-5 text-muted">
              Câu lạc bộ chưa đăng tin tức nào. Bấm nút "+ Tạo Tin Tức" để bắt đầu!
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Ảnh</th>
                    <th className="admin-table-header py-3 px-4">Tiêu đề tin tức</th>
                    <th className="admin-table-header py-3 px-4">Ngày tạo</th>
                    <th className="admin-table-header py-3 px-4">Học kỳ</th>
                    <th className="admin-table-header py-3 px-4" style={{ width: '150px' }}>Trạng thái</th>
                    <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0', width: '180px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4">
                        <div style={{ width: '60px', height: '40px', overflow: 'hidden', borderRadius: '4px' }}>
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&auto=format&fit=crop'} 
                            alt={item.title} 
                            className="w-100 h-100 object-fit-cover"
                          />
                        </div>
                      </td>
                      <td className="fw-bold py-3 px-4 text-dark">{item.title}</td>
                      <td className="py-3 px-4 text-muted small">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-dark">{item.term || 'Fall2026'}</td>
                      <td className="py-3 px-4">
                        <div>
                          {getStatusBadge(item.status)}
                          {item.status === 'rejected' && item.pdpFeedback && (
                            <div className="text-danger small mt-1 italic" style={{ fontSize: '0.75rem', maxWidth: '150px' }}>
                              Lý do: {item.pdpFeedback}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-pill px-3 d-flex align-items-center gap-1"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <FaEdit size={12} /> Sửa
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-pill px-3 d-flex align-items-center gap-1"
                            onClick={() => handleDelete(item.id, item.title)}
                          >
                            <FaTrash size={12} /> Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Thêm/Sửa Tin tức */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {modalType === 'create' ? 'Tạo Tin Tức Mới' : 'Chỉnh Sửa Tin Tức'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="px-4 py-3">
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-dark">Tiêu đề tin tức</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nhập tiêu đề tin tức..."
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-dark">Đường dẫn hình ảnh (URL)</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Nhập URL ảnh minh họa (ví dụ: https://images.unsplash.com/photo-...)"
                value={image} 
                onChange={(e) => setImage(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Bạn có thể lấy link ảnh từ Unsplash hoặc bất cứ dịch vụ lưu trữ ảnh công khai nào.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-dark">Nội dung bài viết</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={8}
                placeholder="Nhập nội dung bài viết chi tiết..."
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </Form.Group>

            {modalType === 'edit' && selectedNews && selectedNews.status === 'approved' && (
              <Alert variant="warning" className="small mb-0">
                <strong>Lưu ý:</strong> Bài viết này đang ở trạng thái <strong>Đã duyệt</strong>. Việc chỉnh sửa và lưu lại sẽ chuyển trạng thái bài viết về <strong>Chờ duyệt</strong> và yêu cầu ban PDP xem xét phê duyệt lại trước khi được hiển thị lại trên trang chính thức.
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer className="px-4 pb-4 border-0">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowModal(false)}
              className="rounded-pill px-4"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="rounded-pill px-4 btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : (modalType === 'create' ? 'Tạo & Gửi duyệt' : 'Lưu thay đổi')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default NewsTab;
