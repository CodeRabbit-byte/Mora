import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StripeModal from '../components/StripeModal.jsx';
import Page from '../components/Page.jsx';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
  viewport: { once: true },
};

const features = [
  {
    title: 'Effort XP',
    body: 'Every minute you show up earns XP. Not for finishing. Not for perfect sessions. Just for starting and staying.',
  },
  {
    title: 'Your wins feed',
    body: 'A private record of every time you showed up. No streaks to break. No comparison. Just you, getting better at being you.',
  },
  {
    title: 'Focus profile',
    body: "After 20 sessions, Mora starts showing you your patterns. When you're sharpest. What conditions help you most. A mirror, not a verdict.",
  },
];

const testimonials = [
  {
    quote: "I've tried every productivity app. Mora is the first one that didn't make me feel worse about myself.",
    name: 'AJ, Year 2 university',
  },
  {
    quote: 'The 5-minute start thing sounds stupid until the third time you do it and suddenly an hour has passed.',
    name: 'Priya, A-levels',
  },
  {
    quote: "I don't think about whether I deserve XP. I just get it. That's the whole point.",
    name: 'Marcus, first year',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <Page>
      <main className="bg-mora-bg text-mora-text">
        <section className="flex min-h-screen items-center justify-center px-5 pb-20 pt-24">
          <div className="mx-auto flex max-w-[680px] flex-col items-center text-center">
            <div className="rounded-full border border-mora-border px-4 py-2 text-[13px] text-mora-muted">For students</div>
            <h1 className="heading-tight mt-8 text-[48px] font-medium leading-[1.1] sm:text-[64px]">
              Starting is the hard part. We make <span className="text-mora-accent">starting</span> the only part.
            </h1>
            <p className="mt-6 max-w-[480px] text-lg leading-8 text-mora-muted">
              Mora rewards you for showing up — not for finishing. Built for students who know what to do and can't start doing it.
            </p>
            <div className="mt-12">
              <button
                type="button"
                onClick={() => navigate('/start')}
                className="rounded-full bg-mora-accent px-8 py-3.5 font-medium text-mora-bg"
              >
                Start for free
              </button>
              <p className="mt-4 text-[13px] text-mora-muted">$15/year after 20 sessions. No card required to start.</p>
            </div>
            <div className="mt-12 hidden w-[360px] rounded-2xl border border-mora-border bg-mora-surface p-6 text-left min-[480px]:block">
              <p className="text-xs text-mora-muted">current task</p>
              <p className="mt-3 text-base text-mora-text">Open the document</p>
              <div className="mt-5 flex gap-2">
                {[0, 1, 2, 3].map((dot) => (
                  <span
                    key={dot}
                    className={`h-2.5 w-2.5 rounded-full ${dot < 3 ? 'bg-mora-accent' : 'border border-mora-border'}`}
                  />
                ))}
              </div>
              <button type="button" className="mt-6 w-full rounded-full bg-mora-accent px-6 py-3 text-sm font-medium text-mora-bg">
                Start — 5 min
              </button>
            </div>
          </div>
        </section>

        <section className="px-5 py-[120px]">
          <motion.div {...fadeInUp} className="mx-auto max-w-[680px]">
            <p className="text-xs uppercase tracking-[0.18em] text-mora-muted">Why Mora exists</p>
            <h2 className="heading-tight mt-5 text-4xl font-medium leading-tight">You're not lazy. You're competing with slot machines.</h2>
            <div className="mt-8 space-y-5 text-base leading-8 text-mora-muted">
              <p>TikTok and Instagram are designed by billion-dollar teams to make starting anything else feel impossible.</p>
              <p>Mora makes the first moment of starting frictionless, small enough that your brain stops negotiating with it.</p>
              <p>Over time, Mora shows you what you look like at your best: when you focus, what helps, and how you keep returning.</p>
            </div>
          </motion.div>
        </section>

        <section className="bg-[#0D0D0D] px-5 py-[120px]">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeInUp} className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-mora-muted">What it does</p>
              <h2 className="heading-tight mt-5 text-4xl font-medium leading-tight">A smaller first move, repeated until it becomes yours.</h2>
            </motion.div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <motion.article
                  key={feature.title}
                  {...fadeInUp}
                  className="rounded-2xl border border-mora-border bg-mora-surface p-6"
                >
                  <h3 className="heading-tight text-xl font-medium">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-mora-muted">{feature.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-[120px]">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeInUp} className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-mora-muted">From students</p>
              <h2 className="heading-tight mt-5 text-4xl font-medium leading-tight">The win is getting into motion.</h2>
            </motion.div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {testimonials.map((testimonial) => (
                <motion.article
                  key={testimonial.name}
                  {...fadeInUp}
                  className="rounded-2xl border border-mora-border bg-mora-surface p-6"
                >
                  <p className="text-base leading-7 text-mora-text">"{testimonial.quote}"</p>
                  <p className="mt-6 text-sm text-mora-muted">{testimonial.name}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[#0D0D0D] px-5 py-[120px]">
          <motion.div {...fadeInUp} className="mx-auto max-w-[480px] rounded-2xl border border-mora-border bg-mora-surface p-8">
            <p className="text-sm text-mora-muted">One plan</p>
            <h2 className="heading-tight mt-3 text-5xl font-medium">$15/year</h2>
            <p className="mt-5 text-base leading-7 text-mora-muted">
              Start free, unlock your focus profile after 20 sessions, then keep your progress growing for less than a study snack.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-mora-text">
              <li>Five-minute sessions</li>
              <li>Custom timers after upgrade</li>
              <li>Whiteboard image uploads after upgrade</li>
              <li>XP and win history</li>
              <li>Focus profile insights</li>
              <li>Local progress saving</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-8 w-full rounded-full bg-mora-accent px-6 py-4 text-sm font-medium text-mora-bg"
            >
              Get started — $15/yr
            </button>
          </motion.div>
        </section>

        <footer className="px-5 py-12">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 border-t border-mora-border pt-8 sm:flex-row">
            <div>
              <p className="text-lg font-medium">Mora</p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-mora-muted">A small ritual for students who need help beginning.</p>
            </div>
            <div className="flex gap-6 text-sm text-mora-muted">
              <a href="#pricing">Pricing</a>
              <button type="button" onClick={() => navigate('/start')}>
                Start
              </button>
            </div>
          </div>
        </footer>
      </main>
      <StripeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        successRedirectTo="/start?stripe=success"
      />
    </Page>
  );
}
