import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { Banknote, RefreshCcw, ArrowRight } from 'lucide-react'

export default function PickerPayouts() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await apiCall('/pickers/payouts')
        if (res?.data) setData(res.data)
      } catch (err) {
        console.error('Failed to fetch payout data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPayouts()
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
          <h1 className="text-2xl font-bold">Payouts & Balance</h1>
          <p className="text-sm text-orange-200 mt-1">Manage your earnings and payouts</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Available Balance</p>
                <p className="text-4xl font-black text-gray-900 mt-1">
                  £{data?.available?.[0]?.amount ? (data.available[0].amount / 100).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
                <p className="text-xl font-bold text-gray-500 mt-1">
                  £{data?.pending?.[0]?.amount ? (data.pending[0].amount / 100).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Payout Settings</h3>
              <p className="text-gray-600 mb-6">Connect your bank account with Stripe to receive automatic payouts.</p>
              <button
                onClick={() => navigate('/picker/payout-settings')}
                className="w-full md:w-auto bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
              >
                <Banknote className="w-5 h-5" /> Manage Bank Account
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-orange-500" /> Recent Payouts
                </h3>
              </div>
              <div className="p-6 text-center text-gray-500">
                <p>No recent payouts available.</p>
                <button
                  onClick={() => navigate('/picker/earnings')}
                  className="mt-4 text-orange-600 font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  View Earnings <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
