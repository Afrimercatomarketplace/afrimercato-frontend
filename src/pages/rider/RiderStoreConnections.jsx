import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, Plus, RefreshCw, CheckCircle2, Clock, XCircle, Link2 } from 'lucide-react'

const STATUS_CONFIG = {
  pending:  { label: 'Pending',   color: 'bg-amber-100 text-amber-700',     Icon: Clock },
  approved: { label: 'Connected', color: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
  active:   { label: 'Connected', color: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
  rejected: { label: 'Rejected',  color: 'bg-red-100 text-red-700',         Icon: XCircle },
}

function RiderStoreConnections() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [storeId, setStoreId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const fetchStores = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiCall('/riders/connected-stores')
      const d = res?.data
      // Backend may return { stores: [...] } or a raw array.
      setStores(Array.isArray(d) ? d : (d?.stores || []))
    } catch (_e) {
      setError('Failed to load connected stores.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStores() }, [fetchStores])

  const handleConnect = async (e) => {
    e.preventDefault()
    const id = storeId.trim()
    if (!id) return

    setSubmitting(true)
    setFeedback(null)
    try {
      // encodeURIComponent so weird characters can't break the URL path.
      await apiCall(`/riders/connect-store/${encodeURIComponent(id)}`, { method: 'POST' })
      setFeedback({ type: 'success', message: 'Connection request sent.' })
      setStoreId('')
      setShowForm(false)
      await fetchStores()
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Could not send request.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-afri-gray-50 pb-24">
      <div className="bg-gradient-to-br from-afri-gray-900 via-[#1A1A1A] to-[#2B3632] px-5 pt-14 pb-6 rounded-b-[2rem]">
        <h1 className="text-white text-2xl font-bold">Store Connections</h1>
        <p className="text-afri-green-light text-sm mt-0.5">
          {stores.length} {stores.length === 1 ? 'connection' : 'connections'}
        </p>
      </div>

      <div className="px-5 py-5 space-y-4">
        {feedback && (
          <div className={`rounded-2xl p-4 text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {feedback.message}
          </div>
        )}

        <button
          onClick={() => setShowForm(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-afri-green text-white rounded-2xl font-bold shadow-sm hover:bg-afri-green-dark transition-colors"
        >
          <Plus size={18} /> {showForm ? 'Cancel' : 'Request New Connection'}
        </button>

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleConnect}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3 overflow-hidden"
            >
              <label className="block">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Store ID</span>
                <input
                  type="text"
                  value={storeId}
                  onChange={e => setStoreId(e.target.value)}
                  placeholder="Enter the store's ID"
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-afri-green focus:outline-none text-sm"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={submitting || !storeId.trim()}
                className="w-full py-3 bg-afri-green text-white rounded-xl font-bold disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchStores} className="flex items-center gap-1 text-red-500 text-sm font-semibold">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Store size={28} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-600">No store connections</p>
            <p className="text-xs text-gray-400 mt-1">
              Request a connection to start receiving gigs from a store.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {stores.map((s, i) => {
              const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending
              const { Icon } = cfg
              return (
                <motion.div
                  key={s.id || s._id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
                >
                  <div className="w-11 h-11 bg-afri-green-pale rounded-xl flex items-center justify-center flex-shrink-0">
                    <Store size={20} className="text-afri-green-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {s.storeName || s.store?.name || 'Store'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {s.store?.address?.city || s.address || s.storeId || ''}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.color}`}>
                    <Icon size={12} /> {cfg.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-afri-green-pale rounded-xl flex items-center justify-center flex-shrink-0">
              <Link2 size={18} className="text-afri-green-dark" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">How connections work</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Stores approve your request before you can pick up their gigs. You can disconnect at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiderStoreConnections