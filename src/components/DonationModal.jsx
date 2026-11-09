import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { X, Heart, CheckCircle, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import { donationApi } from '../api/index.js';
import { formatCurrency } from '../lib/utils.js';
import StripePaymentForm from './StripePaymentForm.jsx';
import toast from 'react-hot-toast';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

// Paystack icon SVG
function PaystackIcon() {
  return (
    <svg viewBox="0 0 40 14" className="h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="14" rx="3" fill="#00C3F7"/>
      <text x="4" y="10.5" fontSize="8" fill="white" fontWeight="bold" fontFamily="sans-serif">Paystack</text>
    </svg>
  );
}

export default function DonationModal({ campaign, onClose }) {
  const [step,           setStep]           = useState(1); // 1=amount 2=details 3=payment 4=success
  const [amount,         setAmount]         = useState(50);
  const [customAmount,   setCustomAmount]   = useState('');
  const [payMethod,      setPayMethod]      = useState('stripe'); // 'stripe' | 'paystack'
  const [clientSecret,   setClientSecret]   = useState('');
  const [paymentIntentId,setPaymentIntentId]= useState('');
  const [isSandbox,      setIsSandbox]      = useState(false);
  const [donation,       setDonation]       = useState(null);
  const [loading,        setLoading]        = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { donorName: '', donorEmail: '', isAnonymous: false, message: '' },
  });

  const finalAmount  = customAmount ? parseFloat(customAmount) : amount;
  const watchedValues = watch();

  // Step 1 → 2
  const handleAmountNext = () => {
    if (!finalAmount || finalAmount < 1) { toast.error('Minimum donation is $1'); return; }
    setStep(2);
  };

  // Step 2 → 3
  const onDetailsSubmit = async (values) => {
    setLoading(true);
    try {
      if (payMethod === 'paystack') {
        const { data } = await donationApi.initiatePaystack({
          amount:     finalAmount,
          campaignId: campaign._id,
          donorEmail: values.donorEmail,
          donorName:  values.donorName,
          currency:   'NGN',
        });

        if (data.isSandbox) {
          // Sandbox — skip redirect, record directly
          const confirmed = await donationApi.verifyPaystack(data.reference, {
            campaignId:  campaign._id,
            donorEmail:  values.donorEmail,
            donorName:   values.donorName,
            amount:      finalAmount,
            isAnonymous: values.isAnonymous,
            message:     values.message,
          });
          setDonation(confirmed.data.donation);
          setStep(4);
          toast.success('Thank you! Your donation was received 💛');
        } else {
          // Stash details in sessionStorage so the callback page can verify
          sessionStorage.setItem('ps_campaignId',  campaign._id);
          sessionStorage.setItem('ps_donorEmail',  values.donorEmail);
          sessionStorage.setItem('ps_donorName',   values.donorName  || '');
          sessionStorage.setItem('ps_amount',      finalAmount);
          sessionStorage.setItem('ps_isAnonymous', values.isAnonymous ? 'true' : 'false');
          sessionStorage.setItem('ps_message',     values.message    || '');
          // Redirect to Paystack hosted payment page
          window.location.href = data.authorizationUrl;
        }
      } else {
        // Stripe flow
        const { data } = await donationApi.createPaymentIntent({
          amount:     finalAmount,
          campaignId: campaign._id,
          donorEmail: values.donorEmail,
        });
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setIsSandbox(!!data.isSandbox);
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = (donationRecord) => {
    setDonation(donationRecord);
    setStep(4);
    toast.success('Thank you! Your donation was received 💛');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="sticky top-0 bg-white border-b border-stone-100 px-6 pt-6 pb-4 flex items-start justify-between rounded-t-3xl z-10">
          <div>
            <div className="flex items-center gap-2 text-brand-500 mb-1">
              <Heart className="w-5 h-5 fill-brand-400" />
              <span className="text-sm font-semibold uppercase tracking-wide">Donate</span>
            </div>
            <h2 className="font-heading font-bold text-stone-900 text-lg leading-snug line-clamp-2">
              {campaign.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 transition flex-shrink-0 ml-4">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* ── Progress bar ────────────────────────────────────────────── */}
        {step < 4 && (
          <div className="px-6 pt-4 pb-2 flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-brand-500' : 'bg-stone-100'}`}
              />
            ))}
          </div>
        )}

        <div className="p-6">

          {/* ── Step 1: Amount ──────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-semibold text-stone-900">Choose an amount</h3>

              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount(''); }}
                    className={`py-3 rounded-xl font-semibold text-sm transition border-2 ${
                      amount === a && !customAmount
                        ? 'border-brand-500 bg-brand-50 text-brand-600'
                        : 'border-stone-200 hover:border-brand-300 text-stone-700'
                    }`}
                  >
                    {formatCurrency(a)}
                  </button>
                ))}
                <button
                  onClick={() => { setAmount(0); }}
                  className={`py-3 rounded-xl font-semibold text-sm transition border-2 ${
                    customAmount ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-stone-200 text-stone-600'
                  }`}
                >
                  Custom
                </button>
              </div>

              {(amount === 0 || customAmount) && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-semibold">$</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="input pl-8"
                    autoFocus
                  />
                </div>
              )}

              <button onClick={handleAmountNext} className="btn-primary w-full">
                Continue with {formatCurrency(finalAmount)} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Step 2: Details + Payment Method ────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-stone-900">Your details</h3>

              <div>
                <label className="label">Full name</label>
                <input {...register('donorName')} className="input" placeholder="Your name (optional)" />
              </div>

              <div>
                <label className="label">Email address *</label>
                <input
                  {...register('donorEmail', {
                    required: 'Email is required',
                    pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                  })}
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                />
                {errors.donorEmail && <p className="text-red-500 text-xs mt-1">{errors.donorEmail.message}</p>}
              </div>

              <div>
                <label className="label">Message (optional)</label>
                <textarea
                  {...register('message')}
                  rows={2}
                  className="input resize-none"
                  placeholder="A kind word for the family…"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                <input type="checkbox" {...register('isAnonymous')} className="w-4 h-4 accent-brand-500" />
                Donate anonymously
              </label>

              {/* ── Payment method picker ──────────────────────────── */}
              <div>
                <label className="label">Pay with</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Stripe */}
                  <button
                    type="button"
                    onClick={() => setPayMethod('stripe')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                      payMethod === 'stripe'
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 ${payMethod === 'stripe' ? 'text-brand-500' : 'text-stone-400'}`} />
                    <span className="text-xs font-semibold text-stone-700">Card / Stripe</span>
                    <span className="text-[10px] text-stone-400">Visa · Mastercard · AmEx</span>
                  </button>

                  {/* Paystack */}
                  <button
                    type="button"
                    onClick={() => setPayMethod('paystack')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                      payMethod === 'paystack'
                        ? 'border-[#00C3F7] bg-sky-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${payMethod === 'paystack' ? 'bg-[#00C3F7] text-white' : 'bg-stone-200 text-stone-500'}`}>P</div>
                    <span className="text-xs font-semibold text-stone-700">Paystack</span>
                    <span className="text-[10px] text-stone-400">Cards · Bank · USSD</span>
                  </button>
                </div>
              </div>

              {payMethod === 'paystack' && (
                <div className="text-xs text-stone-500 bg-sky-50 border border-sky-200 rounded-xl p-3">
                  💡 You'll be redirected to Paystack's secure hosted payment page, then brought back here.
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-ghost flex-1 border border-stone-200"
                >
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up…</>
                    : payMethod === 'paystack'
                      ? 'Go to Paystack →'
                      : 'Continue →'
                  }
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: Stripe Payment ───────────────────────────────── */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 className="font-semibold text-stone-900 mb-4">Card Payment</h3>
              {clientSecret && (stripePromise || isSandbox) ? (
                <Elements
                  stripe={stripePromise}
                  options={isSandbox ? undefined : { clientSecret }}
                >
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    paymentIntentId={paymentIntentId}
                    campaignId={campaign._id}
                    amount={finalAmount}
                    donorName={watchedValues.donorName}
                    donorEmail={watchedValues.donorEmail}
                    isAnonymous={watchedValues.isAnonymous}
                    message={watchedValues.message}
                    isSandbox={isSandbox}
                    onSuccess={handleStripeSuccess}
                  />
                </Elements>
              ) : (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                </div>
              )}
              <button
                onClick={() => setStep(2)}
                className="btn-ghost w-full mt-3 text-sm text-stone-400"
              >
                ← Change payment method
              </button>
            </div>
          )}

          {/* ── Step 4: Success ─────────────────────────────────────── */}
          {step === 4 && (
            <div className="text-center py-6 animate-slide-up">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-stone-900 mb-2">Thank You! 💛</h3>
              <p className="text-stone-500 mb-4">
                Your gift of <strong>{formatCurrency(finalAmount)}</strong> has been received.
                {watchedValues.donorEmail && (
                  <> Confirmation sent to <strong>{watchedValues.donorEmail}</strong>.</>
                )}
              </p>
              {donation?.receiptNumber && (
                <div className="bg-stone-50 rounded-xl p-3 text-sm text-stone-600 mb-6">
                  Receipt: <strong className="font-mono">{donation.receiptNumber}</strong>
                </div>
              )}
              <button onClick={onClose} className="btn-primary w-full">Close</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
