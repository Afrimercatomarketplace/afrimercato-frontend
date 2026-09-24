Rider ratings and PIN security fixes
The user is confused. Let me help them clearly.

They have these files in their project:

pages/rider/RiderRatings.jsx - rider-side page showing their own ratings (this is the H3 task - new file)

components/RiderRating.jsx - vendor-side card to rate a rider (this already existed, they forgot to mention it)

Some other file related to orders showing rider ratings

The user is saying:

"help rewrite this file full pstch a and b not clear help dont know if this is correct"

Their RiderDeliveries.jsx patch A and B isn't clear

They're confused about where the two rating files go

Let me help by:

Rewriting RiderDeliveries.jsx completely as a full file so they can just paste it

Explaining the file locations clearly with a folder tree

Explaining the two rating files clearly

Let me first fix that broken code they pasted. There's clearly a typo: set ding(null)na which should be setActionLoading(null).

Let me write out the FULL RiderDeliveries.jsx file so there's no confusion.

I also need to clearly explain the file structure:

text
src/
├── pages/
│   └── rider/
│       ├── RiderRatings.jsx         ← Rider page (plural) - NEW - rider views their OWN ratings
│       ├── RiderDeliveries.jsx      ← Rider deliveries list
│       ├── RiderDeliveryDetail.jsx  ← Single delivery detail
│       ├── RiderEarnings.jsx        ← Rider earnings
│       └── RiderStoreConnections.jsx ← Rider store connections (NEW)
└── components/
    └── RiderRating.jsx              ← Component (singular) - VENDOR uses this to rate the rider
So the two rating files serve DIFFERENT roles:

pages/rider/RiderRatings.jsx (plural) = Rider-facing page. Rider opens this to see reviews they received.

components/RiderRating.jsx (singular) = Vendor-facing card. Vendor clicks this on an order to submit a rating for the rider.

They're not duplicates. They're two sides of the same system.

Let me write out the full RiderDeliveries.jsx so they can just paste it entirely, no partial patches.

Let me also provide a clear file tree diagram.

I should be direct and clear. Let me write the full file.

Stop — let me clear up the file confusion first, then give you ONE full file to paste
Why there are two "rider rating" files (they are NOT duplicates)
text
afrimercato-frontend/src/
│
├── pages/rider/
│   ├── RiderRatings.jsx          ← RIDER opens this. It shows reviews the rider RECEIVED.
│   │                               ("What do customers say about ME?")
│   │                               Route: /rider/ratings
│   │
│   ├── RiderDeliveries.jsx       ← Rider's delivery list
│   ├── RiderDeliveryDetail.jsx   ← Single delivery detail
│   ├── RiderEarnings.jsx         ← Rider earnings
│   └── RiderStoreConnections.jsx ← Rider's store connection requests (NEW)
│
└── components/
    └── RiderRating.jsx           ← VENDOR uses this. It's a card on the ORDER DETAILS page.
                                    Vendor clicks stars to rate the rider who delivered.
                                    ("Rate this delivery guy.")
Two sides of the same feature — both must exist.

File	Who opens it	What it does	Called from
pages/rider/RiderRatings.jsx	Rider	Reads ratings the rider received	/rider/ratings route
components/RiderRating.jsx	Vendor	Submits a rating for a rider	Vendor's order-details page imports it
Think of it like a review system:

components/RiderRating.jsx = the "Leave a review" form (vendor side)

pages/rider/RiderRatings.jsx = the "See my reviews" page (rider side)

Both stay. Don't delete either.

The order file you mention — that's just the vendor's order-details page that imports the component. Something like:

jsx
// pages/vendor/OrderDetails.jsx (or similar)
import RiderRating from '../../components/RiderRating'

// ...inside the JSX:
<RiderRating order={order} onRatingSubmitted={refetchOrder} />
You don't touch that file unless the import path was wrong.

Now — RiderDeliveries.jsx FULL FILE (no more partial patches)
The reason patch A & B were confusing is that I gave you snippets, not the full file. Here's the entire file. Paste it over your existing afrimercato-frontend/src/pages/rider/RiderDeliveries.jsx. No manual patching.

jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, MapPin, Clock, Ruler, ChevronRight, RefreshCw, Lock } from 'lucide-react'

const STATUS_CONFIG = {
  pending: { label: 'Awaiting Pickup', color: 'bg-amber-100 text-amber-700', stripe: 'bg-amber-400' },
  assigned_to_rider: { label: 'Accepted', color: 'bg-blue-100 text-blue-700', stripe: 'bg-blue-400' },
  picked_up_by_rider: { label: 'Picked Up', color: 'bg-indigo-100 text-indigo-700', stripe: 'bg-indigo-400' },
  out_for_delivery: { label: 'In Transit', color: 'bg-afri-green-pale text-afri-green-dark', stripe: 'bg-afri-green' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', stripe: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', stripe: 'bg-red-500' },
}

const FILTERS = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
]

function SkeletonDelivery() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-1 bg-gray-200 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-28" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-44" />
        <div className="h-3 bg-gray-200 rounded w-36" />
      </div>
    </div>
  )
}

function RiderDeliveries() {
  const navigate = useNavigate()
  const [deliveries, setDeliveries] = useState([])
  const [filter, setFilter] = useState('active')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)

  const [activeDeliveryId, setActiveDeliveryId] = useState(null)
  const [pinModalType, setPinModalType] = useState(null)
  const [pin, setPin] = useState('')

  const fetchDeliveries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (filter === 'active') {
        const res = await apiCall('/riders/deliveries/active')
        setDeliveries(res?.data?.deliveries || [])
      } else if (filter === 'completed') {
        const res = await apiCall('/riders/earnings')
        setDeliveries(res?.data?.deliveries || [])
      } else if (filter === 'cancelled') {
        const res = await apiCall('/riders/deliveries/cancelled')
        setDeliveries(res?.data?.deliveries || [])
      } else {
        setDeliveries([])
      }
    } catch (_e) {
      setError('Failed to load deliveries.')
      setDeliveries([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchDeliveries() }, [fetchDeliveries])

  // Handles the three action types: pickup (PIN modal), complete (PIN modal),
  // and unassign (confirm + API + refetch). Anything else falls through to
  // a generic POST + refetch.
  const handleAction = async (e, id, action) => {
    e.stopPropagation()
    if (!action) return

    // These two open the PIN modal instead of firing an API call.
    if (action === 'pickup') {
      setActiveDeliveryId(id)
      setPinModalType('pickup')
      return
    }
    if (action === 'complete') {
      setActiveDeliveryId(id)
      setPinModalType('delivery')
      return
    }

    // H9 BUG FIX: unassign used to fire-and-return without refetching,
    // so the dropped gig stayed on screen. Now we await, refetch, and
    // surface backend errors.
    if (action === 'unassign') {
      const confirmDrop = window.confirm(
        'Are you sure you want to drop this gig? It will affect your completion rate.'
      )
      if (!confirmDrop) return

      setActionLoading(id + action)
      try {
        await apiCall(`/riders/deliveries/${id}/unassign`, { method: 'POST' })
        await fetchDeliveries()
      } catch (err) {
        alert(err?.response?.data?.message || err?.message || 'Could not drop this gig.')
      } finally {
        setActionLoading(null)
      }
      return
    }

    // Generic fallback (accept, etc.)
    setActionLoading(id + action)
    try {
      await apiCall(`/riders/deliveries/${id}/${action}`, { method: 'POST' })
      await fetchDeliveries()
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update status. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  // Called when the rider taps "Verify & Finish" inside the PIN modal.
  const handlePinSubmit = async () => {
    if (pin.length !== 4) return alert('Please enter a 4-digit PIN')
    if (!activeDeliveryId) return

    setActionLoading('pin_submit')
    try {
      if (pinModalType === 'pickup') {
        await apiCall(`/riders/deliveries/${activeDeliveryId}/pickup`, {
          method: 'POST',
          body: JSON.stringify({ pickupPin: pin }),
        })
      } else if (pinModalType === 'delivery') {
        await apiCall(`/riders/deliveries/${activeDeliveryId}/complete`, {
          method: 'POST',
          body: JSON.stringify({ deliveryPin: pin }),
        })
      }

      setPinModalType(null)
      setPin('')
      setActiveDeliveryId(null)
      await fetchDeliveries()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Invalid PIN. Please try again.')
    } finally {
      // FIXED: was `set ding(null)na` in your paste — this is the correct call.
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-afri-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-afri-gray-900 via-[#1A1A1A] to-[#2B3632] px-5 pt-14 pb-6 rounded-b-[2rem]">
        <h1 className="text-white text-2xl font-bold">My Deliveries</h1>
        <p className="text-afri-green-light text-sm mt-0.5">
          {deliveries.length} {filter} {deliveries.length === 1 ? 'delivery' : 'deliveries'}
        </p>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Filter tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                filter === f.id
                  ? 'bg-afri-green text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchDeliveries} className="flex items-center gap-1 text-red-500 text-sm font-semibold">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {[1, 2, 3].map(i => <SkeletonDelivery key={i} />)}
            </motion.div>
          ) : deliveries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-12 text-center shadow-sm"
            >
              <div className="w-20 h-20 bg-afri-green-pale rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-afri-green-light" />
              </div>
              <p className="font-bold text-gray-700 text-lg">No {filter} deliveries</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === 'active'
                  ? 'New orders will appear here when assigned to you'
                  : 'Nothing here yet'}
              </p>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {deliveries.map((d, i) => {
                const id = d.id || d._id
                const defaultStatus = filter === 'completed' ? 'delivered' : 'pending'
                const st = STATUS_CONFIG[d.status] || STATUS_CONFIG[defaultStatus]
                const actualVendor = d.vendor || (d.items?.length > 0 ? d.items[0].vendor : null)
                const vendorName = actualVendor?.storeName || actualVendor?.name || 'Partner Store'
                const orderItems = d.items || d.order?.items || []
                const earnings = Number(d.riderEarnings || d.earnings || d.deliveryFee || 0).toFixed(2)

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => navigate(`/rider/delivery/${id}`)}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className={`h-1 w-full ${st.stripe}`} />
                    <div className="p-4">
                      {/* Top row: order number + status + earnings */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-gray-900 text-sm">
                              {d.order?.orderNumber || d.orderNumber || id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.color}`}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">
                            From: <span className="text-gray-800">{vendorName}</span>
                          </p>
                        </div>
                        <span className="text-lg font-black text-emerald-600">£{earnings}</span>
                      </div>

                      {/* Items preview */}
                      {orderItems.length > 0 && (
                        <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Package size={10} /> Order Items ({orderItems.length})
                          </p>
                          <div className="space-y-1">
                            {orderItems.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700 font-medium truncate pr-2">
                                  <span className="text-gray-400 mr-1">{item.quantity}x</span>
                                  {item.name || item.product?.name || `Product`}
                                </span>
                              </div>
                            ))}
                            {orderItems.length > 2 && (
                              <p className="text-xs text-afri-green font-semibold pt-1">
                                + {orderItems.length - 2} more item(s)
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Delivery address */}
                      <div className="flex items-start gap-2 mb-3">
                        <MapPin size={14} className="text-afri-green mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            Deliver to: {d.deliveryAddress?.fullName || d.customer?.name || 'Customer'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {d.deliveryAddress
                              ? [d.deliveryAddress.street, d.deliveryAddress.city, d.deliveryAddress.postcode]
                                  .filter(Boolean)
                                  .join(', ')
                              : d.deliveryAddress?.address || '—'}
                          </p>
                        </div>
                      </div>

                      {/* Bottom row: metrics + actions (only for active) */}
                      {filter === 'active' && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {d.distance && (
                              <span className="flex items-center gap-1"><Ruler size={11} />{d.distance} km</span>
                            )}
                            {d.estimatedDeliveryTime && (
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {new Date(d.estimatedDeliveryTime).toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {/* H9: Drop button — disabled while its own request is in-flight. */}
                            {d.status === 'assigned_to_rider' && (
                              <button
                                onClick={e => handleAction(e, id, 'unassign')}
                                disabled={actionLoading === id + 'unassign'}
                                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === id + 'unassign' ? '...' : 'Drop'}
                              </button>
                            )}

                            {d.status === 'assigned_to_rider' && (
                              <button
                                onClick={e => handleAction(e, id, 'pickup')}
                                disabled={actionLoading === id + 'pickup'}
                                className="px-4 py-1.5 bg-afri-green text-white text-xs font-bold rounded-xl disabled:opacity-50"
                              >
                                {actionLoading === id + 'pickup' ? '...' : 'Confirm Pickup'}
                              </button>
                            )}

                            {(d.status === 'picked_up_by_rider' || d.status === 'out_for_delivery') && (
                              <button
                                onClick={e => handleAction(e, id, 'complete')}
                                disabled={actionLoading === id + 'complete'}
                                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                              >
                                {actionLoading === id + 'complete' ? '...' : '✓ Delivered'}
                              </button>
                            )}

                            <button
                              onClick={e => { e.stopPropagation(); navigate(`/rider/delivery/${id}`) }}
                              className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified PIN modal (pickup + delivery) */}
        <AnimatePresence>
          {pinModalType && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                onClick={() => { setPinModalType(null); setPin(''); setActiveDeliveryId(null) }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white rounded-2xl p-6 z-50 shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      pinModalType === 'pickup' ? 'bg-orange-100' : 'bg-emerald-100'
                    }`}
                  >
                    <Lock
                      size={28}
                      className={pinModalType === 'pickup' ? 'text-orange-500' : 'text-emerald-500'}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {pinModalType === 'pickup' ? 'Secure Pickup' : 'Complete Delivery'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    {pinModalType === 'pickup'
                      ? 'Enter the 4-digit PIN provided by the vendor.'
                      : 'Enter the 4-digit PIN provided by the customer.'}
                  </p>
                </div>

                <input
                  type="text"
                  maxLength="4"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-4xl font-black tracking-[0.5em] text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl py-4 mb-6 focus:border-afri-green focus:outline-none transition-colors"
                  placeholder="••••"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => { setPinModalType(null); setPin(''); setActiveDeliveryId(null) }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePinSubmit}
                    disabled={pin.length !== 4 || actionLoading === 'pin_submit'}
                    className={`flex-1 py-3 text-white font-bold rounded-xl disabled:opacity-50 transition-colors ${
                      pinModalType === 'pickup'
                        ? 'bg-[#FF8F00] hover:bg-[#E68100]'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {actionLoading === 'pin_submit' ? 'Verifying...' : 'Verify & Finish'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default RiderDeliveries
The one broken line in your paste: set ding(null)na — that was a copy-paste corruption. In the full file above it's the correct setActionLoading(null) inside the finally block.

Master file map — paste each file exactly here
text
afrimercato-frontend/src/
│
├── pages/rider/
│   ├── RiderRatings.jsx          ← File 1 (NEW — rider views received ratings)
│   ├── RiderDeliveries.jsx       ← File 2 (FULL REPLACE — bug fix H9)
│   ├── RiderEarnings.jsx         ← (no change)
│   ├── RiderDeliveryDetail.jsx   ← (no change — already correct)
│   └── RiderStoreConnections.jsx ← File 3 (NEW)
│
└── components/
    └── RiderRating.jsx           ← File 4 (REPLACE — vendor's rating card)
text
afrimercato-backend/src/
│
└── routes/
    └── riderStoreRoutes.js       ← File 5 (REPLACE — adds rate limiting on PINs)
#	Paste this	Into this exact path	Action
1	First code block from my previous reply	src/pages/rider/RiderRatings.jsx	Create new
2	The big code block above in this reply	src/pages/rider/RiderDeliveries.jsx	Overwrite whole file
3	Third code block from my previous reply	src/pages/rider/RiderStoreConnections.jsx	Create new
4	The one you just sent me, but swap feedback: feedback.trim() for comment: feedback.trim().slice(0, 500) and add if (hasRated) return inside handleSubmit	src/components/RiderRating.jsx	Overwrite whole file
5	Backend route block from my previous reply	src/routes/riderStoreRoutes.js	Overwrite whole file
What the vendor "order" file is (and why you don't touch it)
Somewhere in your project, on the vendor side, there's a page like:

text
src/pages/vendor/OrderDetails.jsx    (or OrderDetail.jsx, VendorOrders.jsx, etc.)
That file has a line like:

jsx
import RiderRating from '../../components/RiderRating'
…and somewhere in its JSX:

jsx
<RiderRating order={order} onRatingSubmitted={refetchOrder} />
You do not need to edit it. It just consumes the component. As long as components/RiderRating.jsx keeps the same default export (export default RiderRating) and same props (order, onRatingSubmitted), the vendor page keeps working.

The only reason to touch it is if you want to move the component or rename props — you don't.

Backend fix — what I meant earlier (in plain English)
The frontend is done now. The backend still has two security holes that only live in controllers/riderController.js:

Hole	Where	Fix
PIN leaked to rider	getActiveDeliveries and getCancelledDeliveries return the full delivery object, including security.pickupPin and security.deliveryPin. Any rider could just accept a gig and read the PIN from the API response — which defeats the whole point of having a PIN.	Strip those two fields before res.json()
No brute-force protection	confirmPickup and completeDelivery accept unlimited PIN guesses. A 4-digit PIN = 10,000 combos → cracks in seconds.	Rate-limit (done in File 5) + use timing-safe compare inside the controller
I can't hand you the fixed riderController.js because I don't have that file. Two options:

Option A — paste riderController.js here and I'll rewrite it.

Option B — give Copilot this prompt in VSCode (it can see your whole repo):

text
@workspace Open afrimercato-backend/src/controllers/riderController.js and fix two security issues.

Issue 1 — PIN leakage:
getActiveDeliveries and getCancelledDeliveries return full delivery objects.
The rider client must NEVER receive security.pickupPin or security.deliveryPin —
the PIN is spoken TO the rider by the vendor/customer, so returning it defeats the flow.

Add this helper at the top of the file:
  function stripSecretsForRider(delivery) {
    const d = delivery.toObject ? delivery.toObject() : delivery;
    if (d.security) {
      delete d.security.pickupPin;
      delete d.security.deliveryPin;
    }
    return d;
  }

Then in getActiveDeliveries and getCancelledDeliveries, map every delivery
through stripSecretsForRider() before res.json().

Issue 2 — timing-unsafe PIN compare:
In confirmPickup and completeDelivery, replace any `submittedPin === storedPin`
comparison with a timing-safe check:
  - If the stored PIN is bcrypt-hashed, use bcrypt.compare.
  - If it's plaintext (legacy), use crypto.timingSafeEqual on equal-length Buffers.
Never echo the expected PIN in any response (success or error).
Never log the submitted PIN.

Do not rename functions, change route signatures, or alter response shapes.
Show me the diff before applying.
That prompt will get Copilot to do the exact same edits I'd do, in the file it can see.

TL;DR of what changed and why
File	Change	Why
pages/rider/RiderRatings.jsx	NEW	Rider-side page showing received ratings (H3)
pages/rider/RiderDeliveries.jsx	Full file rewritten	Fixes unassign bug (H9) + fixes the broken set ding(null)na line
pages/rider/RiderStoreConnections.jsx	NEW	Rider store connection requests page (H4)
components/RiderRating.jsx	Replace with improved version	Vendor-side rating card — handles both id shapes, sends comment not feedback, caps feedback length, prevents double-submit
routes/riderStoreRoutes.js	Replace	Adds express-rate-limit on /pickup and /complete — blocks PIN brute-force (H12)
controllers/riderController.js	You or Copilot fix it	Strip PINs from rider responses + use timing-safe compare (H12)
I can see this is the only rider retains fire I can see from the previous codes so can you supply the rest because I need to move on supply the rest of the file written Thank you So that we can move on to other better things
The user wants me to just supply the remaining files cleanly so they can move on. They've confirmed RiderRatings.jsx is what they have. They want the rest: RiderStoreConnections.jsx, RiderRating.jsx (component), RiderDeliveries.jsx (full), and riderStoreRoutes.js (backend).

Let me just give them the files cleanly, one after another, without over-explaining. Keep it short and to the point.

Files needed:

pages/rider/RiderStoreConnections.jsx (NEW)

components/RiderRating.jsx (REPLACE)

pages/rider/RiderDeliveries.jsx (FULL REPLACE - fixes H9 + broken line)

routes/riderStoreRoutes.js (REPLACE - rate limiting)

Just deliver them cleanly with minimal commentary.

The 4 remaining files — copy, paste, done
You already have RiderRatings.jsx ✅. Here are the other four. Each has its exact path above it. No patches, no snippets — full files.

FILE 1 of 4 → afrimercato-frontend/src/pages/rider/RiderStoreConnections.jsx (NEW — create it)
jsx
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
FILE 2 of 4 → afrimercato-frontend/src/components/RiderRating.jsx (REPLACE existing)
jsx
import { useState } from 'react'
import { vendorAPI } from '../../services/api'

// Vendor-side card to rate the rider who delivered an order.
// Two modes: rate-mode (not yet rated) and read-only mode (already rated).

const MAX_FEEDBACK_LEN = 500

// Support both id shapes across the app.
const getOrderId = (order) => order?.id || order?._id
const getRider = (order) => order?.rider || order?.riderId || null
const getExistingRating = (order) => order?.riderRating || order?.vendorRating || null

function RiderRating({ order, onRatingSubmitted }) {
  const existing = getExistingRating(order)

  const [rating, setRating] = useState(existing?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  // Accept `comment` (new) or `feedback` (legacy) so old orders still render.
  const [feedback, setFeedback] = useState(existing?.comment || existing?.feedback || '')
  const [submitting, setSubmitting] = useState(false)

  const hasRated = !!existing
  const rider = getRider(order)

  // Guard: nothing to rate if no rider on the order.
  if (!rider) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-afri-gray-600">No delivery agent assigned to this order</p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating < 1 || rating > 5) {
      alert('Please select a rating between 1 and 5 stars.')
      return
    }
    const orderId = getOrderId(order)
    if (!orderId) {
      alert('Order reference is missing — cannot submit rating.')
      return
    }
    // Belt-and-braces: never let a double-click or re-submit through.
    if (hasRated) return

    try {
      setSubmitting(true)
      // Send `comment` (new field). Backend may accept `feedback` for legacy.
      const response = await vendorAPI.rateRider(orderId, {
        rating: Number(rating),
        comment: feedback.trim().slice(0, MAX_FEEDBACK_LEN),
      })

      if (response.success) {
        alert('Thank you for rating the delivery agent!')
        if (onRatingSubmitted) onRatingSubmitted(response.data)
      } else {
        alert(response.message || 'Rating was not saved. Please try again.')
      }
    } catch (error) {
      console.error('Rating submission error:', error)
      alert(error?.response?.data?.message || 'Failed to submit rating. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = () => (
    <div className="flex items-center space-x-2" role="radiogroup" aria-label="Rider rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hoveredRating || rating)
        return (
          <button
            key={star}
            type="button"
            disabled={hasRated || submitting}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-checked={rating === star}
            role="radio"
            onMouseEnter={() => !hasRated && setHoveredRating(star)}
            onMouseLeave={() => !hasRated && setHoveredRating(0)}
            onClick={() => !hasRated && setRating(star)}
            className={`text-4xl transition-all transform ${
              hasRated ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${filled ? 'animate-starPulse' : ''}`}
          >
            {filled ? (
              <span className="text-afri-yellow drop-shadow-lg">⭐</span>
            ) : (
              <span className="text-gray-300">☆</span>
            )}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 animate-fadeIn">
      <div className="flex items-center space-x-4 pb-4 border-b">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-afri-green to-afri-green-dark flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {rider.name?.charAt(0).toUpperCase() || 'R'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-afri-gray-900">
            {hasRated ? 'Your Rating' : 'Rate Delivery Agent'}
          </h3>
          <p className="text-afri-gray-600">{rider.name || 'Delivery Agent'}</p>
          {rider.phone && (
            <p className="text-sm text-afri-gray-500">{rider.phone}</p>
          )}
        </div>
        {hasRated && (
          <div className="ml-auto">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Rated
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <label className="block text-sm font-semibold text-afri-gray-900 mb-3">
            How was your delivery experience?
          </label>
          {renderStars()}
          <div className="mt-2 min-h-[20px]">
            {rating > 0 && (
              <p className="text-sm text-afri-gray-600 animate-slideDown">
                {rating === 5 && '🎉 Excellent!'}
                {rating === 4 && '😊 Great!'}
                {rating === 3 && '👍 Good'}
                {rating === 2 && '😐 Could be better'}
                {rating === 1 && '😞 Poor'}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
            Additional Feedback{' '}
            {!hasRated && <span className="text-afri-gray-500 font-normal">(Optional)</span>}
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={hasRated || submitting}
            maxLength={MAX_FEEDBACK_LEN}
            rows={4}
            placeholder={
              hasRated
                ? 'No feedback provided'
                : 'Share your thoughts about the delivery service...'
            }
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent resize-none ${
              hasRated ? 'bg-gray-50 cursor-default' : ''
            }`}
          />
          {!hasRated && (
            <p className="text-xs text-afri-gray-400 text-right mt-1">
              {feedback.length} / {MAX_FEEDBACK_LEN}
            </p>
          )}
        </div>

        {!hasRated && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="px-8 py-3 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  Submit Rating
                </>
              )}
            </button>
          </div>
        )}

        {hasRated && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-afri-gray-700">
              Thank you for your feedback! Your rating helps us improve our delivery service.
            </p>
          </div>
        )}
      </form>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes starPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .animate-fadeIn    { animation: fadeIn 0.5s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-starPulse { animation: starPulse 0.3s ease-out; }
      `}</style>
    </div>
  )
}

export default RiderRating
FILE 3 of 4 → afrimercato-frontend/src/pages/rider/RiderDeliveries.jsx (REPLACE whole file)
jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, MapPin, Clock, Ruler, ChevronRight, RefreshCw, Lock } from 'lucide-react'

const STATUS_CONFIG = {
  pending: { label: 'Awaiting Pickup', color: 'bg-amber-100 text-amber-700', stripe: 'bg-amber-400' },
  assigned_to_rider: { label: 'Accepted', color: 'bg-blue-100 text-blue-700', stripe: 'bg-blue-400' },
  picked_up_by_rider: { label: 'Picked Up', color: 'bg-indigo-100 text-indigo-700', stripe: 'bg-indigo-400' },
  out_for_delivery: { label: 'In Transit', color: 'bg-afri-green-pale text-afri-green-dark', stripe: 'bg-afri-green' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', stripe: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', stripe: 'bg-red-500' },
}

const FILTERS = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
]

function SkeletonDelivery() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-1 bg-gray-200 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-28" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-44" />
        <div className="h-3 bg-gray-200 rounded w-36" />
      </div>
    </div>
  )
}

function RiderDeliveries() {
  const navigate = useNavigate()
  const [deliveries, setDeliveries] = useState([])
  const [filter, setFilter] = useState('active')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)

  const [activeDeliveryId, setActiveDeliveryId] = useState(null)
  const [pinModalType, setPinModalType] = useState(null)
  const [pin, setPin] = useState('')

  const fetchDeliveries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (filter === 'active') {
        const res = await apiCall('/riders/deliveries/active')
        setDeliveries(res?.data?.deliveries || [])
      } else if (filter === 'completed') {
        const res = await apiCall('/riders/earnings')
        setDeliveries(res?.data?.deliveries || [])
      } else if (filter === 'cancelled') {
        const res = await apiCall('/riders/deliveries/cancelled')
        setDeliveries(res?.data?.deliveries || [])
      } else {
        setDeliveries([])
      }
    } catch (_e) {
      setError('Failed to load deliveries.')
      setDeliveries([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchDeliveries() }, [fetchDeliveries])

  // Handles three action types:
  //   - pickup / complete → open the PIN modal
  //   - unassign          → confirm, call API, then refetch (H9 bug fix)
  //   - anything else     → generic POST + refetch
  const handleAction = async (e, id, action) => {
    e.stopPropagation()
    if (!action) return

    if (action === 'pickup') {
      setActiveDeliveryId(id)
      setPinModalType('pickup')
      return
    }
    if (action === 'complete') {
      setActiveDeliveryId(id)
      setPinModalType('delivery')
      return
    }

    // H9: previously this fired the unassign request and returned without
    // refetching, so the dropped gig stayed on screen. Now we await, refetch,
    // and surface backend errors.
    if (action === 'unassign') {
      const confirmDrop = window.confirm(
        'Are you sure you want to drop this gig? It will affect your completion rate.'
      )
      if (!confirmDrop) return

      setActionLoading(id + action)
      try {
        await apiCall(`/riders/deliveries/${id}/unassign`, { method: 'POST' })
        await fetchDeliveries()
      } catch (err) {
        alert(err?.response?.data?.message || err?.message || 'Could not drop this gig.')
      } finally {
        setActionLoading(null)
      }
      return
    }

    // Generic fallback (accept, etc.)
    setActionLoading(id + action)
    try {
      await apiCall(`/riders/deliveries/${id}/${action}`, { method: 'POST' })
      await fetchDeliveries()
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to update status. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return alert('Please enter a 4-digit PIN')
    if (!activeDeliveryId) return

    setActionLoading('pin_submit')
    try {
      if (pinModalType === 'pickup') {
        await apiCall(`/riders/deliveries/${activeDeliveryId}/pickup`, {
          method: 'POST',
          body: JSON.stringify({ pickupPin: pin }),
        })
      } else if (pinModalType === 'delivery') {
        await apiCall(`/riders/deliveries/${activeDeliveryId}/complete`, {
          method: 'POST',
          body: JSON.stringify({ deliveryPin: pin }),
        })
      }

      setPinModalType(null)
      setPin('')
      setActiveDeliveryId(null)
      await fetchDeliveries()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Invalid PIN. Please try again.')
    } finally {
      // Was corrupted to `set ding(null)na` in the earlier paste — this is correct.
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-afri-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-afri-gray-900 via-[#1A1A1A] to-[#2B3632] px-5 pt-14 pb-6 rounded-b-[2rem]">
        <h1 className="text-white text-2xl font-bold">My Deliveries</h1>
        <p className="text-afri-green-light text-sm mt-0.5">
          {deliveries.length} {filter} {deliveries.length === 1 ? 'delivery' : 'deliveries'}
        </p>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Filter tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                filter === f.id
                  ? 'bg-afri-green text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchDeliveries} className="flex items-center gap-1 text-red-500 text-sm font-semibold">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {[1, 2, 3].map(i => <SkeletonDelivery key={i} />)}
            </motion.div>
          ) : deliveries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-12 text-center shadow-sm"
            >
              <div className="w-20 h-20 bg-afri-green-pale rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-afri-green-light" />
              </div>
              <p className="font-bold text-gray-700 text-lg">No {filter} deliveries</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === 'active'
                  ? 'New orders will appear here when assigned to you'
                  : 'Nothing here yet'}
              </p>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {deliveries.map((d, i) => {
                const id = d.id || d._id
                const defaultStatus = filter === 'completed' ? 'delivered' : 'pending'
                const st = STATUS_CONFIG[d.status] || STATUS_CONFIG[defaultStatus]
                const actualVendor = d.vendor || (d.items?.length > 0 ? d.items[0].vendor : null)
                const vendorName = actualVendor?.storeName || actualVendor?.name || 'Partner Store'
                const orderItems = d.items || d.order?.items || []
                const earnings = Number(d.riderEarnings || d.earnings || d.deliveryFee || 0).toFixed(2)

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => navigate(`/rider/delivery/${id}`)}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className={`h-1 w-full ${st.stripe}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-gray-900 text-sm">
                              {d.order?.orderNumber || d.orderNumber || id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.color}`}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">
                            From: <span className="text-gray-800">{vendorName}</span>
                          </p>
                        </div>
                        <span className="text-lg font-black text-emerald-600">£{earnings}</span>
                      </div>

                      {orderItems.length > 0 && (
                        <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Package size={10} /> Order Items ({orderItems.length})
                          </p>
                          <div className="space-y-1">
                            {orderItems.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700 font-medium truncate pr-2">
                                  <span className="text-gray-400 mr-1">{item.quantity}x</span>
                                  {item.name || item.product?.name || `Product`}
                                </span>
                              </div>
                            ))}
                            {orderItems.length > 2 && (
                              <p className="text-xs text-afri-green font-semibold pt-1">
                                + {orderItems.length - 2} more item(s)
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2 mb-3">
                        <MapPin size={14} className="text-afri-green mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            Deliver to: {d.deliveryAddress?.fullName || d.customer?.name || 'Customer'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {d.deliveryAddress
                              ? [d.deliveryAddress.street, d.deliveryAddress.city, d.deliveryAddress.postcode]
                                  .filter(Boolean)
                                  .join(', ')
                              : d.deliveryAddress?.address || '—'}
                          </p>
                        </div>
                      </div>

                      {filter === 'active' && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {d.distance && (
                              <span className="flex items-center gap-1"><Ruler size={11} />{d.distance} km</span>
                            )}
                            {d.estimatedDeliveryTime && (
                              <span className="flex items-center gap-1">
                                <Clock size={11} />
                                {new Date(d.estimatedDeliveryTime).toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {/* H9: Drop button — disabled while its own request is in-flight. */}
                            {d.status === 'assigned_to_rider' && (
                              <button
                                onClick={e => handleAction(e, id, 'unassign')}
                                disabled={actionLoading === id + 'unassign'}
                                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === id + 'unassign' ? '...' : 'Drop'}
                              </button>
                            )}

                            {d.status === 'assigned_to_rider' && (
                              <button
                                onClick={e => handleAction(e, id, 'pickup')}
                                disabled={actionLoading === id + 'pickup'}
                                className="px-4 py-1.5 bg-afri-green text-white text-xs font-bold rounded-xl disabled:opacity-50"
                              >
                                {actionLoading === id + 'pickup' ? '...' : 'Confirm Pickup'}
                              </button>
                            )}

                            {(d.status === 'picked_up_by_rider' || d.status === 'out_for_delivery') && (
                              <button
                                onClick={e => handleAction(e, id, 'complete')}
                                disabled={actionLoading === id + 'complete'}
                                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                              >
                                {actionLoading === id + 'complete' ? '...' : '✓ Delivered'}
                              </button>
                            )}

                            <button
                              onClick={e => { e.stopPropagation(); navigate(`/rider/delivery/${id}`) }}
                              className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified PIN modal */}
        <AnimatePresence>
          {pinModalType && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                onClick={() => { setPinModalType(null); setPin(''); setActiveDeliveryId(null) }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white rounded-2xl p-6 z-50 shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      pinModalType === 'pickup' ? 'bg-orange-100' : 'bg-emerald-100'
                    }`}
                  >
                    <Lock
                      size={28}
                      className={pinModalType === 'pickup' ? 'text-orange-500' : 'text-emerald-500'}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {pinModalType === 'pickup' ? 'Secure Pickup' : 'Complete Delivery'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    {pinModalType === 'pickup'
                      ? 'Enter the 4-digit PIN provided by the vendor.'
                      : 'Enter the 4-digit PIN provided by the customer.'}
                  </p>
                </div>

                <input
                  type="text"
                  maxLength="4"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-4xl font-black tracking-[0.5em] text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl py-4 mb-6 focus:border-afri-green focus:outline-none transition-colors"
                  placeholder="••••"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => { setPinModalType(null); setPin(''); setActiveDeliveryId(null) }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePinSubmit}
                    disabled={pin.length !== 4 || actionLoading === 'pin_submit'}
                    className={`flex-1 py-3 text-white font-bold rounded-xl disabled:opacity-50 transition-colors ${
                      pinModalType === 'pickup'
                        ? 'bg-[#FF8F00] hover:bg-[#E68100]'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {actionLoading === 'pin_submit' ? 'Verifying...' : 'Verify & Finish'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default RiderDeliveries
FILE 4 of 4 → afrimercato-backend/src/routes/riderStoreRoutes.js (REPLACE whole file)
js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const riderController = require('../controllers/riderController');
const riderConnectController = require('../controllers/riderConnectController');
const { uploadDeliveryProof, handleUploadError } = require('../middleware/upload');

// SECURITY: 4-digit PINs are only ~10,000 combos. Without rate limiting,
// an attacker with a stolen rider session could brute-force a PIN in seconds.
// 10 tries per 15 min per IP blocks the attack but allows honest typos.
const pinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many PIN attempts. Try again later.' },
});

router.use(protect, authorize('rider'));

router.put('/status', riderController.updateRiderStatus);
router.get('/earnings', riderController.getEarnings);
router.get('/payouts', riderController.getPayouts);
router.get('/ratings', riderController.getRatings);

// Stripe Connect onboarding
router.post('/connect/onboard', riderConnectController.startOnboarding);
router.get('/connect/status', riderConnectController.getConnectStatus);

router.get('/gigs/available', riderController.getAvailableGigs);
router.post('/gigs/:orderId/accept', riderController.acceptGig);

// Active deliveries
router.get('/deliveries/active', riderController.getActiveDeliveries);
router.get('/deliveries/cancelled', riderController.getCancelledDeliveries);

// PIN-gated actions — rate limited.
router.post('/deliveries/:orderId/pickup', pinLimiter, riderController.confirmPickup);
router.post('/deliveries/:orderId/complete', pinLimiter, riderController.completeDelivery);

// Proof of delivery photo. Field name must be 'photo'.
router.post(
  '/deliveries/:orderId/proof-photo',
  uploadDeliveryProof,
  handleUploadError,
  riderController.uploadDeliveryProof
);

router.post('/deliveries/:orderId/unassign', riderController.dropGig);

router.get('/stats/today', riderController.getTodayStats);

module.exports = router;
Run once:

bash
cd afrimercato-backend && npm i express-rate-limit
Done — that's all 5 files
#	Path	Status
1	pages/rider/RiderRatings.jsx	✅ You already have this
2	pages/rider/RiderStoreConnections.jsx	✅ File 1 above
3	components/RiderRating.jsx	✅ File 2 above
4	pages/rider/RiderDeliveries.jsx	✅ File 3 above
5	routes/riderStoreRoutes.js	✅ File 4 above
Last optional thing: the backend controller riderController.js still leaks PINs in its JSON response and needs a timing-safe compare inside confirmPickup / completeDelivery. When you're ready, paste that file here or feed the Copilot prompt I gave you earlier — that's the only remaining security item. Everything else is now done. Move on 👍

I can see this is the only rider retains fire I can see from the previous codes so can you supply the rest because I need to move on supply the rest of the file written Thank you So that we can move on to other better things

import { useState, useEffect, useCallback } from '.txt
import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import { Star, TrendingUp, RefreshCw, MessageCircle, ThumbsUp } from 'lucide-react'

const PERIODS = [
  { id: 'all',   label: 'All Time' },
  { id: 'month', label: '30 Days'  },
  { id: 'week',  label: '7 Days'   },
]

// Small reusable star row. Fills stars to the nearest whole number.
function StarRow({ value = 0, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  )
}

function RiderRatings() {
  const [period, setPeriod] = useState('all')
  const [ratings, setRatings] = useState([])
  const [summary, setSummary] = useState({
    average: 0,
    total: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRatings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiCall(`/riders/ratings?period=${period}`)
      const d = res?.data || {}

      // Backend may return either a list or {ratings, summary}. Handle both.
      const list = Array.isArray(d) ? d : (d.ratings || [])
      setRatings(list)

      // Prefer server-computed summary; fall back to computing locally.
      if (d.summary) {
        setSummary({
          average: Number(d.summary.averageRating || 0),
          total: Number(d.summary.totalRatings || 0),
          breakdown: d.summary.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        })
      } else {
        const total = list.length
        const sum = list.reduce((acc, r) => acc + (r.rating || 0), 0)
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        list.forEach(r => { if (r.rating) breakdown[r.rating] = (breakdown[r.rating] || 0) + 1 })
        setSummary({ average: total ? sum / total : 0, total, breakdown })
      }
    } catch (_e) {
      setError('Failed to load ratings.')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchRatings() }, [fetchRatings])

  return (
    <div className="min-h-screen bg-afri-gray-50 pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-afri-gray-900 via-[#1A1A1A] to-[#2B3632] px-5 pt-14 pb-28 rounded-b-[2.5rem] relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />
        <div className="relative">
          <p className="text-afri-green-light text-sm font-medium">My Ratings</p>
          <div className="flex items-end gap-3 mt-1">
            <p className="text-white text-5xl font-black">
              {loading ? '—' : summary.average.toFixed(1)}
            </p>
            <div className="pb-2"><StarRow value={summary.average} size={22} /></div>
          </div>
          <p className="text-afri-green-light text-sm mt-1">
            {loading ? '...' : `Based on ${summary.total} ratings`}
          </p>
        </div>
      </div>

      <div className="px-5 -mt-16 space-y-5 pb-4">
        {/* Period pills */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm relative z-10">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                period === p.id
                  ? 'bg-afri-green text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchRatings} className="flex items-center gap-1 text-red-500 text-sm font-semibold">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Breakdown bars */}
        {!loading && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-afri-green" /> Rating Breakdown
            </h2>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = summary.breakdown[star] || 0
                const pct = summary.total > 0 ? (count / summary.total) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-xs font-bold text-gray-700">{star}</span>
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900 font-bold text-lg">Recent Reviews</h2>
            <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">
              {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : ratings.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star size={28} className="text-gray-400" />
              </div>
              <p className="font-semibold text-gray-600">No reviews yet</p>
              <p className="text-xs text-gray-400 mt-1">Complete deliveries to receive ratings.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ratings.map((r, i) => (
                <motion.div
                  key={r.id || r._id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {r.customerName || r.customer?.name || 'Customer'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {r.orderNumber ? `Order ${r.orderNumber} • ` : ''}
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })
                          : ''}
                      </p>
                    </div>
                    <StarRow value={r.rating || 0} />
                  </div>
                  {r.comment && (
                    <div className="flex items-start gap-2 mt-2 bg-gray-50 rounded-xl p-3">
                      <MessageCircle size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-700 leading-relaxed">{r.comment}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Tip card */}
        <div className="bg-gradient-to-br from-afri-green-pale to-white rounded-2xl p-4 border border-afri-green-light/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <ThumbsUp size={18} className="text-afri-green-dark" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Boost your rating</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Deliver on time, keep packages safe, and stay polite — happy customers give 5‑star ratings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiderRatings
