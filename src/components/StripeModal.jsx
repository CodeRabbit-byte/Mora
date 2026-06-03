import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { IconCheck, IconExternalLink } from '@tabler/icons-react';
import { useMora } from '../context/MoraContext.jsx';

const stripeTestPaymentLink = import.meta.env.VITE_STRIPE_TEST_PAYMENT_LINK;
const upgradeBenefits = ['Custom 1-60 minute timers', 'Image uploads for whiteboards', 'Growing focus profile insights'];

function buildStripeCheckoutUrl(paymentLink, successRedirectTo) {
  if (!paymentLink || !successRedirectTo) return paymentLink;

  try {
    const url = new URL(paymentLink);
    const returnUrl = new URL(successRedirectTo, window.location.origin).toString();
    url.searchParams.set('client_reference_id', 'mora_demo_checkout');
    url.searchParams.set('mora_return_url', returnUrl);
    return url.toString();
  } catch {
    return paymentLink;
  }
}

function onlyDigits(value) {
  return value.replace(/\D/g, '');
}

function formatCard(value) {
  return onlyDigits(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

function isFutureExpiry(value) {
  const digits = onlyDigits(value);
  if (digits.length !== 4) return false;
  const month = Number(digits.slice(0, 2));
  const year = Number(`20${digits.slice(2)}`);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

function validateTestPayment(form) {
  const card = onlyDigits(form.card);
  const cvc = onlyDigits(form.cvc);

  if (!form.email.includes('@')) return 'Enter an email for the test receipt.';
  if (card === '4000000000000002') return 'That Stripe test card is configured to decline.';
  if (card !== '4242424242424242') return 'Use Stripe test card 4242 4242 4242 4242 for a successful test.';
  if (!isFutureExpiry(form.expiry)) return 'Use any future expiry date.';
  if (cvc.length < 3) return 'Use any 3 digit CVC.';
  if (!form.name.trim()) return 'Enter a name for the test checkout.';
  return '';
}

export default function StripeModal({ open, onClose, onSuccess, successRedirectTo }) {
  const { setSubscribed } = useMora();
  const [form, setForm] = useState({
    email: '',
    card: '',
    expiry: '',
    cvc: '',
    name: '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setStatus('idle');
      setError('');
      setForm({ email: '', card: '', expiry: '', cvc: '', name: '' });
    }
  }, [open]);

  if (!open) return null;

  const stripeCheckoutUrl = buildStripeCheckoutUrl(stripeTestPaymentLink, successRedirectTo);

  const updateField = (event) => {
    const { name, value } = event.target;
    setError('');
    setForm((current) => {
      if (name === 'card') return { ...current, card: formatCard(value) };
      if (name === 'expiry') return { ...current, expiry: formatExpiry(value) };
      if (name === 'cvc') return { ...current, cvc: onlyDigits(value).slice(0, 4) };
      return { ...current, [name]: value };
    });
  };

  const submit = (event) => {
    event.preventDefault();
    if (status !== 'idle') return;

    const validationError = validateTestPayment(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setStatus('processing');
    window.setTimeout(() => {
      setSubscribed(true);
      setStatus('success');
      onSuccess?.();
      window.setTimeout(() => {
        if (successRedirectTo) {
          window.location.assign(successRedirectTo);
          return;
        }

        onClose();
      }, 1600);
    }, 1800);
  };

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && status !== 'processing') onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-[420px] rounded-[20px] border border-[#2A2A2A] bg-mora-surface p-8 sm:p-10"
      >
        {status === 'success' ? (
          <div className="flex min-h-[330px] flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-mora-accent text-mora-bg">
              <IconCheck size={32} stroke={2.2} />
            </div>
            <h2 className="heading-tight text-3xl font-medium">You're in.</h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-mora-muted">
              Custom timers, image uploads, and growing profile insights are unlocked.
            </p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-mora-muted">Mora yearly</p>
              <span className="rounded-full border border-mora-accent px-3 py-1 text-xs font-medium text-mora-accent">
                Stripe test mode
              </span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-4">
              <h2 className="heading-tight text-3xl font-medium">$15</h2>
              <span className="pb-1 text-sm text-mora-muted">Per year</span>
            </div>
            <div className="mt-6 space-y-3 rounded-2xl border border-mora-border bg-mora-bg p-4">
              {upgradeBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-sm text-mora-text">
                  <IconCheck size={16} stroke={2} className="shrink-0 text-mora-accent" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            {stripeCheckoutUrl ? (
              <a
                href={stripeCheckoutUrl}
                rel="noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-mora-accent px-6 py-4 text-sm font-medium text-mora-bg"
              >
                Continue to Stripe checkout
                <IconExternalLink size={16} stroke={1.8} />
              </a>
            ) : null}
            <div className={`${stripeCheckoutUrl ? 'mt-6 border-t border-mora-border pt-6' : 'mt-8'} space-y-3`}>
              {stripeCheckoutUrl ? (
                <p className="text-center text-xs leading-5 text-mora-muted">
                  Or run the local test checkout below
                </p>
              ) : null}
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="Email"
                className="w-full rounded-2xl border border-mora-border bg-mora-bg px-4 py-3 outline-none transition-colors focus:border-mora-accent"
              />
              <input
                name="card"
                inputMode="numeric"
                value={form.card}
                onChange={updateField}
                placeholder="4242 4242 4242 4242"
                className="w-full rounded-2xl border border-mora-border bg-mora-bg px-4 py-3 outline-none transition-colors focus:border-mora-accent"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="expiry"
                  inputMode="numeric"
                  value={form.expiry}
                  onChange={updateField}
                  placeholder="12 / 34"
                  className="w-full rounded-2xl border border-mora-border bg-mora-bg px-4 py-3 outline-none transition-colors focus:border-mora-accent"
                />
                <input
                  name="cvc"
                  inputMode="numeric"
                  value={form.cvc}
                  onChange={updateField}
                  placeholder="CVC"
                  className="w-full rounded-2xl border border-mora-border bg-mora-bg px-4 py-3 outline-none transition-colors focus:border-mora-accent"
                />
              </div>
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Name on card"
                className="w-full rounded-2xl border border-mora-border bg-mora-bg px-4 py-3 outline-none transition-colors focus:border-mora-accent"
              />
            </div>
            <p className="mt-4 text-center text-xs leading-5 text-mora-muted">
              Use 4242 4242 4242 4242 with any future date and CVC. This is a demo — no real payment is taken.
            </p>
            <button
              type="submit"
              disabled={status === 'processing'}
              className="mt-8 w-full rounded-full bg-mora-accent px-6 py-4 text-sm font-medium text-mora-bg"
            >
              {status === 'processing' ? 'Processing...' : 'Run test payment'}
            </button>
            {error ? <p className="mt-4 text-center text-xs leading-5 text-mora-accent">{error}</p> : null}
          </form>
        )}
      </motion.div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}
