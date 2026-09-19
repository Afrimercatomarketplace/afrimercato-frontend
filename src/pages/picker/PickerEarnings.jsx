import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { TrendingUp, DollarSign, Calendar } from 'lucide-react'

export default function PickerEarnings() {
  const navigate = useNavigate()
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await apiCall('/pickers/earnings')
        if (res?.data) {
          setEarnings(res.data)
        }
      } catch (err) {
        console.error('Failed to fetch earnings', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEarnings()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/picker/dashboard')}
            className="text-orange-200 hover:text-white mb-4 text-sm"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
          <p className="text-sm text-orange-200 mt-1">Track your picking income</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : earnings ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-500"/> Total Earned
                </p>
                <p className="text-2xl font-bold text-gray-900">£{earnings.summary?.totalEarnings || '0.00'}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-500"/> Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">{earnings.summary?.totalOrders || 0}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow p-5 border-l-4 border-purple-500">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-purple-500"/> Rate per Order
                </p>
                <p className="text-2xl font-bold text-gray-900">£{earnings.summary?.ratePerOrder || '0.00'}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow p-5 border-l-4 border-orange-500">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-orange-500"/> Avg / Order
                </p>
                <p className="text-2xl font-bold text-gray-900">£{earnings.summary?.averageEarningsPerOrder || '0.00'}</p>
              </div>
            </div>

            {/* Earnings by Date */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500"/> Daily Breakdown
                </h3>
              </div>
              
              <div className="divide-y">
                {earnings.earningsByDate?.length > 0 ? (
                  earnings.earningsByDate.map((day, idx) => (
                    <div key={idx} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-500">{day.orders} orders picked</p>
                      </div>
                      <p className="font-bold text-green-600">£{day.earnings.toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">No earnings data available yet.</div>
                )}
              </div>
            </div>
            
            {/* Recent Sessions */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Recent Sessions</h3>
              </div>
              
              <div className="divide-y">
                {earnings.sessions?.length > 0 ? (
                  earnings.sessions.slice(0, 10).map((session, idx) => (
                    <div key={idx} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{session.vendor || 'Unknown Store'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.completedAt).toLocaleString()} • {session.accuracy}% accuracy
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">£{session.earned.toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">No session data available yet.</div>
                )}
              </div>
            </div>
            
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow p-6">
            <p>Could not load earnings data.</p>
          </div>
        )}
      </div>
    </div>
  )
}
