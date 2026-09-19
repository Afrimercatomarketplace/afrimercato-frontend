import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { CheckCircle, Clock, Package } from 'lucide-react'

export default function PickerHistory() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiCall('/pickers/history')
        if (res?.data?.sessions) {
          setHistory(res.data.sessions)
        }
      } catch (err) {
        console.error('Failed to fetch history', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
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
          <h1 className="text-2xl font-bold">Picking History</h1>
          <p className="text-sm text-orange-200 mt-1">Your past picking sessions</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow p-6">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>You have no picking history yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(session => (
              <div key={session.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      Order #{session.order?.orderNumber || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-500">{session.vendor?.storeName || 'Unknown Store'}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm border-t pt-4">
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-4 h-4"/> Duration</p>
                    <p className="font-semibold">{session.totalDuration || 0} mins</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Accuracy</p>
                    <p className="font-semibold">{session.accuracy || 0}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center gap-1">Earnings</p>
                    <p className="font-semibold text-green-600">£{(session.earnings || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-400">
                  Completed: {new Date(session.completedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
