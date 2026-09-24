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