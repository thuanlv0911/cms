import React, { useState, useEffect, useContext } from 'react';
import { Button } from 'react-bootstrap';
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
  FaFileAlt
} from 'react-icons/fa';

import PdpOverview from './components/PdpOverview';
import PdpSemesters from './components/PdpSemesters';
import PdpEvents from './components/PdpEvents';
import PdpNews from './components/PdpNews';
import PdpNotifications from './components/PdpNotifications';
import PdpReports from './components/PdpReports';

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

  const activeSem = semesters.find(sem => getSemesterStatus(sem) === 'Đang diễn ra');
  const activeSemName = activeSem ? activeSem.name : '';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <PdpOverview
            clubs={clubs}
            allEvents={allEvents}
            allNews={allNews}
            allReports={allReports}
            allUsers={allUsers}
            activeSemName={activeSemName}
            loading={dashboardLoading}
          />
        );
      case 'semesters':
        return (
          <PdpSemesters
            semesters={semesters}
            loading={loading}
            error={error}
            fetchSemesters={fetchSemesters}
            getSemesterStatus={getSemesterStatus}
          />
        );
      case 'slots-events':
        return <PdpEvents fetchDashboardData={fetchDashboardData} />;
      case 'news':
        return <PdpNews />;
      case 'notifications':
        return <PdpNotifications />;
      case 'reports':
        return <PdpReports />;
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
    </div>
  );
};

export default PdpDashboard;
