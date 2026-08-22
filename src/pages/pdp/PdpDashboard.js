import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Table, Button, Alert, Badge, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { semesterService, clubService, eventService, newsService, reportService, authService } from '../../services/api';
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaCalendarCheck,
  FaNewspaper,
  FaBell,
  FaSignOutAlt,
  FaUserCircle,
  FaFileAlt,
  FaUsers
} from 'react-icons/fa';

const PdpDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'pdp') {
      navigate('/unauthorized');
    }
  }, [currentUser, navigate]);

  const [activeTab, setActiveTab] = useState('dashboard');

  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [clubs, setClubs] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
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

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const data = await semesterService.getAll();

      const sorted = [...data].sort((a, b) => {
        const dateA = parseDateStr(a.startDate);
        const dateB = parseDateStr(b.startDate);
        return (dateB || 0) - (dateA || 0);
      });
      setSemesters(sorted);
    } catch (err) {
      console.error('Lỗi khi tải học kỳ:', err);
      setError('Không thể tải danh sách học kỳ từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      const [clubsData, eventsData, newsData, reportsData, usersData] = await Promise.all([
        clubService.getAll(),
        eventService.getAll(),
        newsService.getAll(),
        reportService.getAll(),
        authService.getAllUsers()
      ]);
      setClubs(clubsData);
      setAllEvents(eventsData);
      setAllNews(newsData);
      setAllReports(reportsData);
      setAllUsers(usersData);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu thống kê dashboard:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'pdp') {
      fetchSemesters();
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const convertToDbDate = (inputDate) => {
    if (!inputDate) return '';
    const [year, month, day] = inputDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const getSemesterStatus = (sem) => {
    const start = parseDateStr(sem.startDate);
    const end = parseDateStr(sem.endDate);
    if (!start || !end) return 'Không xác định';

    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (today < start) {
      return 'Sắp diễn ra';
    } else if (today >= start && today <= end) {
      return 'Đang diễn ra';
    } else {
      return 'Đã kết thúc';
    }
  };

  const getClubCategoryBadge = (category) => {
    switch (category) {
      case 'Học thuật':
        return <Badge bg="primary" className="px-3 py-2 fw-medium rounded-pill">Học thuật</Badge>;
      case 'Nghệ thuật':
        return <Badge bg="danger" className="px-3 py-2 fw-medium rounded-pill">Nghệ thuật</Badge>;
      case 'Thể thao':
        return <Badge bg="success" className="px-3 py-2 fw-medium rounded-pill">Thể thao</Badge>;
      case 'Lĩnh vực khác':
        return <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Lĩnh vực khác</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2 fw-medium rounded-pill">{category}</Badge>;
    }
  };

  const handleOpenAddModal = () => {
    setSelectedSemester(null);
    setSemName('');
    setSemStartDate('');
    setSemEndDate('');
    setModalError('');
    setModalSuccess('');
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

    const isDuplicateName = semesters.some(s => 
      s.name.toLowerCase() === semName.trim().toLowerCase() && 
      (!selectedSemester || s.id !== selectedSemester.id)
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

      if (selectedSemester) {
        await semesterService.update(selectedSemester.id, semData);
        setModalSuccess('Cập nhật học kỳ thành công!');
      } else {
        await semesterService.create(semData);
        setModalSuccess('Thêm học kỳ mới thành công!');
      }

      await fetchSemesters();
      setTimeout(() => {
        setShowSemesterModal(false);
      }, 1000);
    } catch (err) {
      console.error('Lỗi khi lưu học kỳ:', err);
      setModalError(err.message || 'Có lỗi xảy ra khi lưu học kỳ.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser || currentUser.role !== 'pdp') {
    return null;
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard PDP';
      case 'semesters':
        return 'Quản lý Học kỳ';
      case 'slots-events':
        return 'Quản lý Slots - Events';
      case 'news':
        return 'Quản lý Tin tức';
      case 'notifications':
        return 'Quản lý Thông báo';
      case 'reports':
        return 'Duyệt Báo cáo Hậu Sự kiện';
      default:
        return 'Dashboard PDP';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tổng quan hoạt động và các chỉ số thống kê của PDP';
      case 'semesters':
        return 'Quản lý danh sách các học kỳ, thời gian bắt đầu và kết thúc';
      case 'slots-events':
        return 'Xét duyệt, quản lý lịch trình các sự kiện và slot đăng ký của CLB';
      case 'news':
        return 'Quản lý và xét duyệt tin tức, bài viết từ các câu luận bộ';
      case 'notifications':
        return 'Gửi và quản lý hệ thống thông báo tới các câu lạc bộ và sinh viên';
      case 'reports':
        return 'Xem xét và phê duyệt báo cáo kết quả sau khi tổ chức sự kiện từ các CLB';
      default:
        return 'Khu vực làm việc của cán bộ phòng PDP';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':

        const activeSem = semesters.find(sem => getSemesterStatus(sem) === 'Đang diễn ra');
        const activeSemName = activeSem ? activeSem.name : '';

        const semesterEventsCount = allEvents.filter(e => e.term === activeSemName && e.status === 'approved').length;
        const semesterNewsCount = allNews.filter(n => n.term === activeSemName && n.status === 'approved').length;
        
        const pendingEventsCount = allEvents.filter(e => e.status === 'pending').length;
        const pendingNewsCount = allNews.filter(n => n.status === 'pending').length;
        const pendingReportsCount = allReports.filter(r => r.status === 'pending').length;
        const totalPendingRequests = pendingEventsCount + pendingNewsCount + pendingReportsCount;

        if (dashboardLoading) {
          return (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2 text-muted">Đang tải dữ liệu thống kê...</p>
            </div>
          );
        }

        return (
          <div>
            <div className="mb-4 bg-white p-3 rounded shadow-sm d-flex align-items-center">
              <span className="fw-bold text-dark me-2 fs-6">Kỳ hoạt động:</span>
              <span className="text-orange fw-bold fs-6">{activeSemName || 'Chưa xác định'}</span>
            </div>

            <Row className="g-4 mb-4">
              <Col md={3}>
                <Card className="border-0 shadow-sm p-3 h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-card-icon bg-light-blue text-blue me-3">
                      <FaUsers size={22} />
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Số lượng CLB</div>
                      <h3 className="fw-bold mb-0 mt-1">{clubs.length}</h3>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm p-3 h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-card-icon bg-light-green text-green me-3">
                      <FaCalendarCheck size={22} />
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Sự kiện trong kỳ</div>
                      <h3 className="fw-bold mb-0 mt-1">{semesterEventsCount}</h3>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm p-3 h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-card-icon bg-light-yellow text-yellow me-3">
                      <FaNewspaper size={20} />
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Tin tức trong kỳ</div>
                      <h3 className="fw-bold mb-0 mt-1">{semesterNewsCount}</h3>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm p-3 h-100">
                  <Card.Body className="d-flex align-items-center">
                    <div className="stat-card-icon bg-light-orange text-orange me-3">
                      <FaBell size={20} />
                    </div>
                    <div>
                      <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>Chờ phê duyệt</div>
                      <h3 className="fw-bold mb-0 mt-1">{totalPendingRequests}</h3>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4 text-dark">Danh sách Câu Lạc Bộ</h5>
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tên Câu Lạc Bộ</th>
                        <th className="admin-table-header py-3 px-4">Loại Câu Lạc Bộ</th>
                        <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0', width: '220px' }}>Số lượng thành viên</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clubs.map((club) => {
                        const memberCount = allUsers.filter(u => u.clubId === club.id).length;
                        return (
                          <tr key={club.id}>
                            <td className="fw-bold py-3 px-4">{club.name}</td>
                            <td className="py-3 px-4">
                              {getClubCategoryBadge(club.category)}
                            </td>
                            <td className="py-3 px-4 fw-semibold text-muted">
                              {memberCount} thành viên
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </div>
        );

      case 'semesters':
        return (
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

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : semesters.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  Không tìm thấy học kỳ nào.
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle">
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
        );

      case 'slots-events':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-dark">Danh sách Sự kiện & Lịch trình Slots</h5>
              <Alert variant="warning" className="mb-4">
                <strong>Tính năng Quản lý Slots - Events:</strong> Hiển thị danh sách sự kiện từ các CLB gửi lên, cho phép PDP phê duyệt hoặc gửi phản hồi chỉnh sửa.
              </Alert>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th className="admin-table-header py-3 px-4" style={{ borderRadius: '8px 0 0 0' }}>Tên Sự Kiện</th>
                      <th className="admin-table-header py-3 px-4">Câu Lạc Bộ</th>
                      <th className="admin-table-header py-3 px-4">Thời gian tổ chức</th>
                      <th className="admin-table-header py-3 px-4">Học kỳ</th>
                      <th className="admin-table-header py-3 px-4" style={{ borderRadius: '0 8px 0 0' }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-bold py-3 px-4">Đêm Trải Nghiệm Cờ Tỷ Phú - Monopoly Night</td>
                      <td className="py-3 px-4">FPTU BoardGame Club</td>
                      <td className="py-3 px-4">10/09/2026 (19:00 - 22:00)</td>
                      <td className="py-3 px-4"><Badge bg="light" className="text-dark border">Fall2026</Badge></td>
                      <td className="py-3 px-4">
                        <Badge bg="warning" className="text-dark px-3 py-2 fw-medium rounded-pill">Đang chờ duyệt</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold py-3 px-4">Workshop: Ứng dụng Generative AI trong Học tập</td>
                      <td className="py-3 px-4">FPTU AI Club</td>
                      <td className="py-3 px-4">05/09/2026 (13:30 - 16:30)</td>
                      <td className="py-3 px-4"><Badge bg="light" className="text-dark border">Summer2026</Badge></td>
                      <td className="py-3 px-4">
                        <Badge bg="success" className="px-3 py-2 fw-medium rounded-pill">Đã duyệt</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold py-3 px-4">Giải đấu Ma Sói Mùa Thu 2026</td>
                      <td className="py-3 px-4">FPTU BoardGame Club</td>
                      <td className="py-3 px-4">01/09/2026 (18:00 - 21:00)</td>
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

      case 'news':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-dark">Duyệt & Quản lý Tin tức</h5>
              <Alert variant="warning" className="mb-4">
                <strong>Tính năng Quản lý Tin tức:</strong> Phê duyệt các bài viết tin tức, thông báo nội bộ từ các CLB trước khi công bố lên trang tin chính thức của trường.
              </Alert>
              <div className="table-responsive">
                <Table hover className="align-middle">
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

      case 'notifications':
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
                <Table hover className="align-middle">
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

      case 'reports':
        return (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-dark">Danh sách Báo cáo Hậu Sự kiện</h5>
              <Alert variant="warning" className="mb-4">
                <strong>Tính năng Duyệt Báo cáo:</strong> Cho phép cán bộ xem báo cáo tổng kết (số lượng người tham gia, hình ảnh, tài chính...) sau sự kiện từ các CLB nộp lên để tiến hành nghiệm thu và đánh giá.
              </Alert>
              <div className="table-responsive">
                <Table hover className="align-middle">
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

      default:
        return null;
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      
      <div className="admin-sidebar shadow-sm">
        <div>
          
          <div 
            className="admin-sidebar-brand d-flex flex-column align-items-center text-center pt-4"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
            title="Quay lại trang chủ"
          >
            <img src="/images/logo_FPTU.svg" alt="Logo FPTU" height="40" className="mb-3" />
          </div>

          <div className="p-3">
            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaTachometerAlt className="me-3" size={18} />
              <span>Dashboard</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'semesters' ? 'active' : ''}`}
              onClick={() => setActiveTab('semesters')}
            >
              <FaCalendarAlt className="me-3" size={18} />
              <span>Quản lý học kỳ</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'slots-events' ? 'active' : ''}`}
              onClick={() => setActiveTab('slots-events')}
            >
              <FaCalendarCheck className="me-3" size={18} />
              <span>Quản lý slots - events</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              <FaNewspaper className="me-3" size={18} />
              <span>Quản lý tin tức</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <FaBell className="me-3" size={18} />
              <span>Thông báo</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FaFileAlt className="me-3" size={18} />
              <span>Duyệt báo cáo</span>
            </div>
          </div>
        </div>

        <div className="admin-profile-section d-flex align-items-center justify-content-between p-3">
          <div className="d-flex align-items-center overflow-hidden">
            <FaUserCircle size={35} className="text-secondary me-2 flex-shrink-0" />
            <div className="text-truncate" style={{ maxWidth: '140px' }}>
              <div className="fw-semibold text-dark small text-truncate">{currentUser.fullName}</div>
              <div className="text-muted small" style={{ fontSize: '0.7rem' }}>Cán bộ PDP</div>
            </div>
          </div>
          <Button
            variant="link"
            className="text-danger p-0 d-flex align-items-center"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <FaSignOutAlt size={20} />
          </Button>
        </div>
      </div>

      <div className="flex-grow-1 p-4 overflow-auto">
        <div className="d-flex align-items-center mb-4 pb-2">
          <div className="dashboard-icon-wrapper me-3">
            {activeTab === 'dashboard' && <FaTachometerAlt size={22} />}
            {activeTab === 'semesters' && <FaCalendarAlt size={22} />}
            {activeTab === 'slots-events' && <FaCalendarCheck size={22} />}
            {activeTab === 'news' && <FaNewspaper size={22} />}
            {activeTab === 'notifications' && <FaBell size={22} />}
            {activeTab === 'reports' && <FaFileAlt size={22} />}
          </div>
          <div>
            <h2 className="fw-bold mb-1 text-dark">{getTabTitle()}</h2>
            <div className="text-muted small">{getTabDescription()}</div>
          </div>
        </div>

        {renderTabContent()}
      </div>

      <Modal show={showSemesterModal} onHide={() => setShowSemesterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            {selectedSemester ? 'Chỉnh sửa Học kỳ' : 'Thêm Học kỳ Mới'}
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
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formSemesterEndDate">
              <Form.Label className="fw-semibold">Ngày kết thúc</Form.Label>
              <Form.Control
                type="date"
                value={semEndDate}
                onChange={(e) => setSemEndDate(e.target.value)}
                required
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

export default PdpDashboard;
