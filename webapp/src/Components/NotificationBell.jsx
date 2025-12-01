import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import AuthContext from '../ContextAPI/AuthContext';

const NotificationBell = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const menuRef = useRef();

    // 1. Lấy số lượng chưa đọc
    const fetchUnreadCount = async () => {
        if (!user || !user.email) return;
        try {
            const res = await fetch(`http://localhost:3000/api/notifications/unread-count?userEmail=${encodeURIComponent(user.email)}`);
            const data = await res.json();
            if (data.success) {
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Lỗi lấy số thông báo:", error);
        }
    };

    // 2. Lấy danh sách chi tiết
    const fetchNotifications = async () => {
        if (!user || !user.email) return;
        try {
            const res = await fetch(`http://localhost:3000/api/notifications?userEmail=${encodeURIComponent(user.email)}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách thông báo:", error);
        }
    };

    // 3. Polling: Gọi API mỗi 5 giây
    useEffect(() => {
        fetchUnreadCount();
        const intervalId = setInterval(() => {
            if (user?.email) fetchUnreadCount();
        }, 5000);
        return () => clearInterval(intervalId);
    }, [user]);

    // Toggle menu
    const handleToggle = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    // Close clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ✅ LOGIC ĐIỀU HƯỚNG DỰA TRÊN ROLE
    const handleNotificationClick = async (notif) => {
        try {
            // 1. Gọi API đánh dấu đã đọc
            await fetch(`http://localhost:3000/api/notifications/${notif.id}/read`, {
                method: 'PUT'
            });
            
            // 2. Cập nhật UI ngay lập tức
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
            setIsOpen(false);

            // 3. Điều hướng theo Role của User
            if (!user) return;

            if (user.role === 'client') {
                // Client: Luôn về trang quản lý dự án của họ
                navigate('/MyProjectPage');
            } else if (user.role === 'freelancer') {
                // Freelancer: Luôn về trang quản lý hồ sơ thầu
                navigate('/MyBidPage');
            } else if (user.role === 'moderator') {
                // Admin/Mod: Tùy loại thông báo
                if (notif.type.includes('project')) navigate('/ApproveRequest');
                else if (notif.type.includes('bid')) navigate('/ApproveBid');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.email) return;
        try {
            await fetch('http://localhost:3000/api/notifications/read-all', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail: user.email })
            });
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={handleToggle} 
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
                    <div className="p-3 border-b border-gray-100 font-semibold text-gray-700 flex justify-between items-center sticky top-0 bg-white z-10">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <span className="text-xs text-blue-500 cursor-pointer hover:underline" onClick={markAllAsRead}>
                                Mark all read
                            </span>
                        )}
                    </div>
                    
                    <div className="py-2">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                // Parse data safely
                                let notifData = notif.data;
                                if (typeof notifData === 'string') {
                                    try { notifData = JSON.parse(notifData); } catch (e) {}
                                }

                                return (
                                    <div 
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 ${!notif.read ? 'bg-blue-50/40' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                            <div>
                                                <p className="text-sm text-gray-800 font-medium">
                                                    {notifData?.title || 'Notification'}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {notifData?.message || 'You have a new update.'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;