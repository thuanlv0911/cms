import React, { useState, useEffect, useContext } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { clubService, eventService, newsService, semesterService, reportService } from '../../services/api';
import DashboardTab from './components/DashboardTab';
import ClubTab from './components/ClubTab';
import EventTab from './components/EventTab';
import NewsTab from './components/NewsTab';
import ReportTab from './components/ReportTab';
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaNewspaper,
  FaSignOutAlt,
  FaUserCircle,
  FaFileAlt
} from 'react-icons/fa';

const PresidentDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [clubInfo, setClubInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [reports, setReports] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [activeSemesterName, setActiveSemesterName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
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

  const getEventTerm = (e) => {
    if (e.term) return e.term;
    if (!e.startDate || semesters.length === 0) return '';
    const date = new Date(e.startDate);
    const matchedSem = semesters.find(sem => {
      const start = parseDateStr(sem.startDate);
      const end = parseDateStr(sem.endDate);
      return start && end && date >= start && date <= end;
    });
    return matchedSem ? matchedSem.name : '';
  };

  const getNewsTerm = (n) => {
    if (n.term) return n.term;
    if (!n.createdAt || semesters.length === 0) return '';
    const date = new Date(n.createdAt);
    const matchedSem = semesters.find(sem => {
      const start = parseDateStr(sem.startDate);
      const end = parseDateStr(sem.endDate);
      return start && end && date >= start && date <= end;
    });
    return matchedSem ? matchedSem.name : '';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!currentUser || !currentUser.clubId) {
        setLoading(false);
        return;
      }

      const [clubsData, semestersData, membersData, eventsData, newsData, reportsData] = await Promise.all([
        clubService.getAll(),
        semesterService.getAll(),
        clubService.getMembers(currentUser.clubId),
        eventService.getByClub(currentUser.clubId),
        newsService.getByClub(currentUser.clubId),
        reportService.getByClub(currentUser.clubId)
      ]);

      const currentClub = clubsData.find(c => c.id === currentUser.clubId);
      setClubInfo(currentClub);

      const sortedSem = [...semestersData].sort((a, b) => {
        const dateA = parseDateStr(a.startDate);
        const dateB = parseDateStr(b.startDate);
        return (dateB || 0) - (dateA || 0);
      });
      setSemesters(sortedSem);

      const activeSem = sortedSem.find(sem => getSemesterStatus(sem) === 'Đang diễn ra');
      const activeSemName = activeSem ? activeSem.name : '';
      setActiveSemesterName(activeSemName);

      setMembers(membersData);
      setEvents(eventsData);
      setNews(newsData);
      setReports(reportsData);

      const eventNotifications = eventsData
        .filter(e => e.pdpFeedback || e.status !== 'pending')
        .map(e => ({
          id: `e-notif-${e.id}`,
          type: 'Sự kiện',
          title: e.title,
          status: e.status,
          feedback: e.pdpFeedback || 'Không có nhận xét chi tiết.',
          date: e.startDate ? e.startDate.split('T')[0] : ''
        }));

      const newsNotifications = newsData
        .filter(n => n.pdpFeedback || n.status !== 'pending')
        .map(n => ({
          id: `n-notif-${n.id}`,
          type: 'Tin tức',
          title: n.title,
          status: n.status,
          feedback: n.pdpFeedback || 'Không có nhận xét chi tiết.',
          date: n.createdAt ? n.createdAt.split('T')[0] : ''
        }));

      const allNotifs = [...eventNotifications, ...newsNotifications].sort((a, b) => {
        return new Date(b.date || 0) - new Date(a.date || 0);
      });
      setNotifications(allNotifs);

    } catch (err) {
      console.error('Lỗi khi tải dữ liệu chủ nhiệm:', err);
      setError('Không thể kết nối đến máy chủ để tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'student' && currentUser.isPresident) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSubmitEvent = async (eventPayload) => {
    try {
      setLoading(true);
      await eventService.create(eventPayload);
      setIsCreatingEvent(false);
      await fetchData();
      alert('Đã gửi sự kiện lên phòng PDP để xét duyệt thành công!');
    } catch (err) {
      console.error('Lỗi khi gửi sự kiện:', err);
      alert('Có lỗi xảy ra khi gửi phê duyệt sự kiện: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'student' || !currentUser.isPresident) {
    return null;
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Chủ nhiệm';
      case 'clubs':
        return 'Quản lý Câu Lạc Bộ';
      case 'events':
        return 'Quản lý Events';
      case 'news':
        return 'Quản lý Tin tức';
      case 'reports':
        return 'Báo cáo hậu sự kiện';
      default:
        return 'Dashboard Chủ nhiệm';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tổng quan hoạt động CLB và lối tắt quản lý nhanh';
      case 'clubs':
        return 'Quản lý thông tin thành viên và hoạt động của câu lạc bộ';
      case 'events':
        return 'Tạo mới, chỉnh sửa và theo dõi trạng thái phê duyệt sự kiện';
      case 'news':
        return 'Đăng tin tức, bài viết truyền thông quảng bá hoạt động CLB';
      case 'reports':
        return 'Nộp và quản lý báo cáo kết quả sau sự kiện để PDP nghiệm thu';
      default:
        return 'Khu vực quản lý dành cho Chủ nhiệm CLB';
    }
  };

  const renderTabContent = () => {
    if (loading && semesters.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-2 text-muted">Đang tải dữ liệu hệ thống...</p>
        </div>
      );
    }

    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab
            clubInfo={clubInfo}
            currentUser={currentUser}
            activeSemesterName={activeSemesterName}
            membersCount={members.length}
            eventsCount={events.filter(e => e.status === 'approved' && getEventTerm(e) === activeSemesterName).length}
            newsCount={news.filter(n => n.status === 'approved' && getNewsTerm(n) === activeSemesterName).length}
            notifications={notifications}
          />
        );

      case 'clubs':
        return <ClubTab members={members} />;

      case 'events':
        return (
          <EventTab
            events={events}
            clubInfo={clubInfo}
            currentUser={currentUser}
            isCreatingEvent={isCreatingEvent}
            setIsCreatingEvent={setIsCreatingEvent}
            onSubmitSuccess={handleSubmitEvent}
            loading={loading}
          />
        );

      case 'news':
        return (
          <NewsTab
            news={news}
            clubInfo={clubInfo}
            currentUser={currentUser}
            semesters={semesters}
            onRefresh={fetchData}
          />
        );

      case 'reports':
        return (
          <ReportTab
            events={events}
            reports={reports}
            clubInfo={clubInfo}
            currentUser={currentUser}
            onRefresh={fetchData}
          />
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
              onClick={() => { setActiveTab('dashboard'); setIsCreatingEvent(false); }}
            >
              <FaTachometerAlt className="me-3" size={18} />
              <span>Dashboard</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'clubs' ? 'active' : ''}`}
              onClick={() => { setActiveTab('clubs'); setIsCreatingEvent(false); }}
            >
              <FaUsers className="me-3" size={18} />
              <span>Quản lý CLB</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => { setActiveTab('events'); setIsCreatingEvent(false); }}
            >
              <FaCalendarAlt className="me-3" size={18} />
              <span>Quản lý events</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => { setActiveTab('news'); setIsCreatingEvent(false); }}
            >
              <FaNewspaper className="me-3" size={18} />
              <span>Quản lý tin tức</span>
            </div>

            <div
              className={`admin-sidebar-link d-flex align-items-center p-3 mb-2 ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => { setActiveTab('reports'); setIsCreatingEvent(false); }}
            >
              <FaFileAlt className="me-3" size={18} />
              <span>Báo cáo hậu sự kiện</span>
            </div>
          </div>
        </div>

        <div className="admin-profile-section d-flex align-items-center justify-content-between p-3">
          <div className="d-flex align-items-center overflow-hidden">
            <FaUserCircle size={35} className="text-secondary me-2 flex-shrink-0" />
            <div className="text-truncate" style={{ maxWidth: '140px' }}>
              <div className="fw-semibold text-dark small text-truncate">Chủ nhiệm</div>
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
            {activeTab === 'clubs' && <FaUsers size={22} />}
            {activeTab === 'events' && <FaCalendarAlt size={22} />}
            {activeTab === 'news' && <FaNewspaper size={22} />}
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

export default PresidentDashboard;
