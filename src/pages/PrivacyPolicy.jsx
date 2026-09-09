import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiCall } from '../../services/api';

/**
 * Privacy Policy Page
 * GDPR-compliant privacy policy for Afrimercato
 * Includes working GDPR action buttons: Export Data, Delete Account, Submit Complaint
 */
function PrivacyPolicy() {
  const { user, isAuthenticated } = useAuth();

  // Loading states for buttons
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [complaintLoading, setComplaintLoading] = useState(false);

  // Feedback messages
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }

  // Complaint modal state
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [complaintError, setComplaintError] = useState('');

  // ===== Helper: show toast message =====
  const showMessage = (type, text) => {
    setMessage({ type, text });
    // Auto‑dismiss after 6 seconds
    setTimeout(() => setMessage(null), 6000);
  };

  // ===== 1. Export Data =====
  const handleExportData = async () => {
    if (!isAuthenticated) {
      showMessage('error', 'Please log in to export your data.');
      return;
    }

    setExportLoading(true);
    try {
      const response = await apiCall('/gdpr/export', { method: 'GET' });
      // The backend should return a JSON blob – we create a downloadable file
      const data = JSON.stringify(response.data, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `afrimercato-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showMessage('success', 'Your data has been exported and downloaded.');
    } catch (error) {
      const msg = error.message || 'Failed to export data. Please try again.';
      showMessage('error', msg);
    } finally {
      setExportLoading(false);
    }
  };

  // ===== 2. Request Account Deletion =====
  const handleDeleteAccount = async () => {
    if (!isAuthenticated) {
      showMessage('error', 'Please log in to request account deletion.');
      return;
    }

    const confirmed = window.confirm(
      '⚠️ Are you sure you want to delete your account?\n\n' +
      'This action is irreversible. All your personal data, orders, and account information will be permanently removed.\n' +
      'You will lose access to your account and any ongoing orders or refunds will be cancelled.\n\n' +
      'Do you wish to proceed?'
    );
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await apiCall('/gdpr/delete', { method: 'DELETE' });
      showMessage('success', 'Account deletion request submitted. You will receive a confirmation email shortly.');
      // Optionally log the user out after a few seconds
      setTimeout(() => {
        window.location.href = '/logout';
      }, 3000);
    } catch (error) {
      const msg = error.message || 'Failed to request deletion. Please try again.';
      showMessage('error', msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ===== 3. Submit GDPR Complaint =====
  const handleComplaintSubmit = async () => {
    if (!isAuthenticated) {
      showMessage('error', 'Please log in to submit a complaint.');
      return;
    }

    const text = complaintText.trim();
    if (!text || text.length < 10) {
      setComplaintError('Please describe your complaint in at least 10 characters.');
      return;
    }
    setComplaintError('');

    setComplaintLoading(true);
    try {
      await apiCall('/gdpr/complaint', {
        method: 'POST',
        body: JSON.stringify({ complaint: text }),
      });
      showMessage('success', 'Your GDPR complaint has been submitted. We will review it within 3 business days.');
      setShowComplaintModal(false);
      setComplaintText('');
    } catch (error) {
      const msg = error.message || 'Failed to submit complaint. Please try again.';
      showMessage('error', msg);
    } finally {
      setComplaintLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/90"
          >
            Last updated: {new Date().toLocaleDateString('en-GB')}
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 md:p-12 space-y-8"
        >
          {/* Toast Message */}
          {message && (
            <div
              className={`p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* GDPR Actions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your GDPR Rights – Take Action
            </h2>
            <div className="flex flex-wrap gap-4">
              {/* Export Button */}
              <button
                onClick={handleExportData}
                disabled={exportLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportLoading ? 'Exporting...' : '📥 Export My Data'}
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Requesting...' : '🗑️ Request Account Deletion'}
              </button>

              {/* Complaint Button */}
              <button
                onClick={() => setShowComplaintModal(true)}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow transition"
              >
                ⚖️ Submit GDPR Complaint
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              These actions are GDPR‑compliant. We respond within 30 days.
            </p>
          </section>

          {/* ===== Existing Policy Sections ===== */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Afrimercato. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we look after your personal data when you visit our
              website or use our services, and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Data We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may collect, use, store and transfer different kinds of personal data about you:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Identity Data:</strong> Name, username, date of birth</li>
              <li><strong>Contact Data:</strong> Email address, telephone numbers, billing and delivery addresses</li>
              <li><strong>Financial Data:</strong> Payment card details (processed securely by our payment providers)</li>
              <li><strong>Transaction Data:</strong> Details about payments and products/services purchased</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              <li><strong>Profile Data:</strong> Username, purchases, preferences, feedback</li>
              <li><strong>Usage Data:</strong> Information about how you use our website and services</li>
              <li><strong>Marketing Data:</strong> Your preferences in receiving marketing from us</li>
              <li><strong>Location Data:</strong> For delivery services and finding nearby stores</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Data</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We will only use your personal data when the law allows us to. Most commonly, we use your data to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Process and deliver your orders</li>
              <li>Manage payments, fees, and charges</li>
              <li>Collect and recover money owed to us</li>
              <li>Send you service, support and administrative messages</li>
              <li>Respond to your comments, questions and requests</li>
              <li>Improve our website, products and services</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may share your personal data with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Vendors:</strong> To fulfill your orders</li>
              <li><strong>Delivery Partners:</strong> To deliver your orders</li>
              <li><strong>Payment Processors:</strong> Stripe, PayPal for secure payment processing</li>
              <li><strong>Service Providers:</strong> For analytics, email services, and customer support</li>
              <li><strong>Legal Authorities:</strong> When required by law</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We never sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We have put in place appropriate security measures to prevent your personal data from being accidentally
              lost, used or accessed in an unauthorized way, altered or disclosed. All payment information is encrypted
              using SSL technology. We limit access to your personal data to those employees, agents, contractors and
              other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights Under GDPR</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Under UK GDPR, you have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object:</strong> Object to processing of your data</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@afrimercato.com" className="text-afri-green hover:underline">
                privacy@afrimercato.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for,
              including for the purposes of satisfying any legal, accounting, or reporting requirements. Account data is
              retained for 7 years after account closure for legal and accounting purposes. Order data is retained for 6
              years to comply with UK tax law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website uses cookies to distinguish you from other users. This helps us provide you with a good
              experience when you browse our website and also allows us to improve our site. You can manage your cookie
              preferences at any time through your browser settings or our cookie consent tool.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700"><strong>Email:</strong> privacy@afrimercato.com</p>
              <p className="text-gray-700"><strong>Address:</strong> Afrimercato Ltd, United Kingdom</p>
              <p className="text-gray-700"><strong>Data Protection Officer:</strong> dpo@afrimercato.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the
              new privacy policy on this page and updating the "Last updated" date.
            </p>
          </section>

          {/* Back Link */}
          <div className="pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="inline-flex items-center text-afri-green hover:text-afri-green-dark font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ===== GDPR Complaint Modal ===== */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Submit GDPR Complaint
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Please describe your complaint in detail. We will review and respond within 3 business days.
            </p>

            <div className="mb-4">
              <label htmlFor="complaint" className="block text-sm font-semibold text-gray-700 mb-2">
                Your complaint <span className="text-red-500">*</span>
              </label>
              <textarea
                id="complaint"
                rows="5"
                value={complaintText}
                onChange={(e) => {
                  setComplaintText(e.target.value);
                  setComplaintError('');
                }}
                className={`w-full px-4 py-3 border ${complaintError ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                placeholder="Describe your GDPR concern..."
              />
              {complaintError && (
                <p className="text-red-600 text-sm mt-1">{complaintError}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => {
                  setShowComplaintModal(false);
                  setComplaintText('');
                  setComplaintError('');
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleComplaintSubmit}
                disabled={complaintLoading}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {complaintLoading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivacyPolicy;