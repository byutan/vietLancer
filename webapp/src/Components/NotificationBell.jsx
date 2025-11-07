import React, { useState, useEffect, useRef, useContext } from 'react';
import AuthContext from '../ContextAPI/AuthContext';
const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // 🔑 Dùng email thay vì userId
  const userEmail = user?.email;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userEmail) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/notifications?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!userEmail) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/unread-count?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userEmail) return;
    
    try {
      const response = await fetch('http://localhost:3000/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });
      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get icon based on notification type
  const getIcon = (icon) => {
    const icons = {
      'check-circle': '✓',
      'x-circle': '✕',
      'clock': '⏱',
      'info': 'ℹ'
    };
    return icons[icon] || 'ℹ';
  };

  // Get color class based on notification color
  const getColorClass = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-300',
      red: 'bg-red-100 text-red-800 border-red-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[color] || colors.blue;
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications on mount and set interval
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [userEmail]);

  // Fetch full notifications when opening dropdown
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!user || !userEmail) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No notification
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${getColorClass(
                        notification.data.color
                      )}`}
                    >
                      {getIcon(notification.data.icon)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {notification.data.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.data.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-start gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          title="Đánh dấu đã đọc"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-600 text-xs"
                        title="Xóa"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                All notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;