import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { donationApi } from '../api/index.js';
import { formatCurrency } from '../lib/utils.js';
import { CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StripePaymentForm({
  clientSecret,
  paymentIntentId,
  campaignId,
  amount,
  donorName,
  donorEmail,
  isAnonymous,
  message,
  isSandbox,
  onSuccess,
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe) return;

    setProcessing(true);
    try {
      let paymentSucceeded = false;

      if (isSandbox) {
        // Sandbox: skip Stripe confirmation, just record donation directly
        paymentSucceeded = true;
      } else {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });
        if (error) {
          toast.error(error.message || 'Payment failed. Please try again.');
          setProcessing(false);
          return;
        }
        paymentSucceeded = paymentIntent?.status === 'succeeded';
      }

      if (paymentSucceeded) {
        const { data } = await donationApi.confirm({
          campaignId,
          donorName,
          donorEmail,
          amount,
          paymentId: paymentIntentId,
          isAnonymous,
          message,
        });
        onSuccess(data.donation);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isSandbox ? (
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">
          <strong>🧪 Sandbox Mode</strong> — No real payment is processed. Click "Complete Donation" to simulate.
        </div>
      ) : (
        <PaymentElement />
      )}

      <div className="bg-brand-50 rounded-xl p-4 flex justify-between items-center">
        <span className="text-stone-600 text-sm font-medium">Donation amount</span>
        <span className="text-xl font-bold text-brand-600">{formatCurrency(amount)}</span>
      </div>

      <button
        type="submit"
        disabled={processing || (!isSandbox && !stripe)}
        className="btn-primary w-full py-4 text-base"
      >
        {processing ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
        ) : (
          <><CheckCircle className="w-5 h-5" /> Complete Donation</>
        )}
      </button>

      <p className="text-center text-xs text-stone-400">
        🔒 Secured by Stripe. Your card details are never stored.
      </p>
    </form>
  );
}
