import { useState, useEffect } from 'react'

const typeIcons = {
  order: '📦',
  promo: '🎉',
  system: '🔔',
  delivery: '🚚'
}

const typeColors = {
  order: 'bg-blue-100 text-blue-600',
  promo: 'bg-yellow-100 text-yellow-600',
  system: 'bg-gray-100 text-gray-600',
  delivery: 'bg-[#FDF8F0] text-[#1B4D3E]'
}

function NotificationsCenter() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Fetch real notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!res.ok) throw new Error('Failed to fetch notifications')
        const json = await res.json()
        if (json.success) {
          setNotifications(json.data.notifications)
        }
      } catch (err) {
        console.error('Error fetching notifications:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  // Delete a single notification
  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) throw new Error('Failed to delete notification')
      // Remove from state only after backend confirms
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  // Delete all notifications
  const clearAll = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/notifications/all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) throw new Error('Failed to clear notifications')
      setNotifications([])
    } catch (err) {
      console.error('Error clearing notifications:', err)
    }
  }

  // Mark one as read (local state only – backend call can be added later)
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    )
  }

  // Mark all as read (local state only – backend call can be added later)
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.read).length

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: `Unread (${unreadCount})` },
    { id: 'order', label: 'Orders' },
    { id: 'promo', label: 'Promotions' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-afri-green-light mt-1">{unreadCount} unread</p>
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-white/80 hover:text-white"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-white/80 hover:text-white"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'bg-afri-green text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <span className="text-6xl">🔔</span>
            <h2 className="text-xl font-bold text-gray-900 mt-4">No notifications</h2>
            <p className="text-gray-500 mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <div
                key={notification._id}
                className={`bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
                  !notification.read ? 'border-l-4 border-afri-green' : ''
                }`}
                onClick={() => markAsRead(notification._id)}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${typeColors[notification.type]}`}>
                    {typeIcons[notification.type]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id) }}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsCenter