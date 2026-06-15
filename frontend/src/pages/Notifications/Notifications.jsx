import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../../services/api';
import { Bell, Check, Trash2 } from 'lucide-react';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import socketService from '../../services/socket';

const Notifications = () => {
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((res) => res.data.data.notifications),
  });

  useEffect(() => {
    // Listen for new notifications
    socketService.on('new-notification', (notification) => {
      refetch();
    });

    return () => {
      socketService.off('new-notification');
    };
  }, [refetch]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with latest activities</p>
        </div>
        <Button onClick={markAllAsRead} variant="secondary">
          <Check className="h-5 w-5 mr-2" />
          Mark All as Read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="card">
        {isLoading ? (
          <Loading />
        ) : notifications?.length === 0 ? (
          <EmptyState
            icon="bell"
            title="No notifications yet"
            description="You're all caught up!"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications?.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${
                      !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Bell className={`h-5 w-5 ${
                        !notification.is_read ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        {!notification.is_read && <Badge variant="info">New</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg" title="Delete">
                      <Trash2 className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
