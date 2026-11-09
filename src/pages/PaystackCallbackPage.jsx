import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { donationApi } from '../api/index.js';
import { formatCurrency } from '../lib/utils.js';
import SEO from '../components/SEO.jsx';

export default function PaystackCallbackPage() {
  const [params]  = useSearchParams();
  const [status,  setStatus]  = useState('verifying'); // verifying | success | failed
  const [donation, setDonation] = useState(null);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const reference  = params.get('reference') || params.get('trxref');
    const campaignId = params.get('campaignId') || sessionStorage.getItem('ps_campaignId');
    const donorEmail = params.get('donorEmail') || sessionStorage.getItem('ps_donorEmail');
    const amount     = params.get('amount')     || sessionStorage.getItem('ps_amount');
    const donorName  = params.get('donorName')  || sessionStorage.getItem('ps_donorName');
    const isAnonymous= params.get('isAnonymous')|| sessionStorage.getItem('ps_isAnonymous');
    const message    = params.get('message')    || sessionStorage.getItem('ps_message');

    if (!reference) {
      setStatus('failed');
      setError('No payment reference found.');
      return;
    }

    donationApi.verifyPaystack(reference, {
      campaignId, donorEmail, amount, donorName, isAnonymous, message,
    })
      .then(({ data }) => {
        setDonation(data.donation);
        setStatus('success');
        // Clean up session storage
        ['ps_campaignId','ps_donorEmail','ps_amount','ps_donorName','ps_isAnonymous','ps_message']
          .forEach((k) => sessionStorage.removeItem(k));
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Payment verification failed.');
        setStatus('failed');
      });
  }, []);

  return (
    <>
      <SEO title="Payment Confirmation" noIndex />
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="card p-10 max-w-md w-full text-center shadow-xl animate-slide-up">

          {status === 'verifying' && (
            <>
              <Loader2 className="w-14 h-14 mx-auto mb-4 text-brand-500 animate-spin" />
              <h1 className="font-heading text-2xl font-bold text-stone-900 mb-2">Verifying payment…</h1>
              <p className="text-stone-500 text-sm">Please wait while we confirm your Paystack transaction.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-stone-900 mb-2">Thank You! 💛</h1>
              <p className="text-stone-500 mb-4">
                Your donation of{' '}
                <strong className="text-brand-600">
                  {donation?.amount ? formatCurrency(donation.amount, donation.currency || 'NGN') : ''}
                </strong>{' '}
                has been received and recorded.
              </p>
              {donation?.receiptNumber && (
                <div className="bg-stone-50 rounded-xl p-3 text-sm text-stone-600 mb-6">
                  Receipt: <strong className="font-mono">{donation.receiptNumber}</strong>
                </div>
              )}
              <Link to="/campaigns" className="btn-primary w-full">
                Browse more campaigns
              </Link>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-stone-900 mb-2">Payment Not Confirmed</h1>
              <p className="text-stone-500 mb-2">{error || 'We could not verify your payment.'}</p>
              <p className="text-stone-400 text-sm mb-6">
                If money was deducted from your account, please email{' '}
                <a href="mailto:support@onekindact.org" className="text-brand-500 hover:underline">
                  support@onekindact.org
                </a>{' '}
                with your reference number.
              </p>
              <Link to="/campaigns" className="btn-secondary w-full">← Back to campaigns</Link>
            </>
          )}

        </div>
      </div>
    </>
  );
}
