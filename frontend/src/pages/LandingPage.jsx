import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Award, CalendarDays, Map, MoonStar, Sparkles, Target, TrendingUp, Users } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const LandingPage = () => {
  useDocumentMeta({
    title: 'NextStep AI | Smarter Education Paths With AI',
    description:
      'Build a modern learning journey with AI skill analysis, personalized roadmaps, progress visibility, and certificate-ready outcomes.',
  })

  const features = [
    { icon: Target, title: 'Skill Gap Analysis', desc: 'Turn resumes and goals into clear next-step learning priorities.' },
    { icon: Map, title: 'Guided Roadmaps', desc: 'Structure every milestone into an education path that stays practical.' },
    { icon: TrendingUp, title: 'Progress Visibility', desc: 'Track streaks, XP, and milestone completion with less friction.' },
    { icon: Award, title: 'Verified Certificates', desc: 'Issue certificate-ready achievements learners can actually share.' },
    { icon: Users, title: 'Healthy Competition', desc: 'Use leaderboards to motivate classrooms, cohorts, or public learners.' },
    { icon: Sparkles, title: 'Adaptive Experience', desc: 'Blend AI suggestions with readable workflows and human teaching goals.' },
  ]

  const highlights = [
    'Built for schools, institutes, and self-paced learning platforms',
    'Readable dashboards for learners, mentors, and administrators',
    'Responsive interface tuned for phone, tablet, laptop, and desktop',
  ]

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="relative overflow-hidden pb-16">
      <div className="pointer-events-none absolute left-[-6rem] top-24 h-56 w-56 rounded-full bg-[var(--hero-orb)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-60 h-72 w-72 rounded-full bg-[var(--brand-lilac)]/20 blur-3xl" />

      <section className="px-3 pt-4 sm:px-5 lg:px-6">
        <div className="page-shell">
          <div className="surface-panel flex flex-col gap-4 rounded-[2rem] px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--text-secondary)]">
              <span className="eyebrow">
                <Sparkles size={14} />
                Education-first AI platform
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-elevated)] px-3 py-2">
                <CalendarDays size={15} />
                {today}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 pb-10 pt-8 sm:px-5 sm:pt-10 lg:px-6 lg:pt-14">
        <div className="page-shell grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="space-y-6"
          >
            <span className="eyebrow">
              <MoonStar size={14} />
              Day and night mode included
            </span>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.95] sm:text-6xl lg:text-7xl">
                A sharper education interface for <span className="text-[var(--brand-orange)]">modern learners</span>.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                NextStep AI combines skill analysis, roadmap planning, measurable progress, and certificate-ready
                learning into one responsive education platform.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary text-base sm:text-lg">
                Start Learning
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary text-base sm:text-lg">
                Explore Dashboard
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-4">
                  <p className="text-sm font-semibold leading-6 text-[var(--text-secondary)]">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="glass-card relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
              <div className="absolute inset-x-8 top-0 h-24 rounded-b-[2rem] bg-[var(--brand-orange)]/10 blur-2xl" />
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Palette direction</p>
                    <h2 className="mt-2 text-2xl font-bold">Soft focus, clear hierarchy</h2>
                  </div>
                  <div className="rounded-full bg-[var(--brand-green)]/16 px-4 py-2 text-sm font-bold text-[var(--text-primary)]">
                    Responsive UI
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {[
                    'var(--brand-lilac)',
                    'var(--brand-orange)',
                    'var(--brand-green)',
                    'var(--brand-sky)',
                    'var(--brand-charcoal)',
                    'var(--brand-blue)',
                  ].map((color, index) => (
                    <div
                      key={color}
                      className={`animate-float-y h-20 rounded-[1.4rem] shadow-lg ${index % 2 === 0 ? '' : '[animation-delay:1s]'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-[var(--surface-strong)] p-4">
                    <p className="text-sm font-semibold text-[var(--text-muted)]">Learner flow</p>
                    <p className="mt-2 text-3xl font-extrabold">Resume to Roadmap to Certificate</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[var(--brand-sky)] p-4 text-[var(--brand-charcoal)]">
                    <p className="text-sm font-semibold opacity-75">Today focus</p>
                    <p className="mt-2 text-3xl font-extrabold">74% weekly completion</p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-muted)]">Education dashboard</p>
                      <p className="mt-1 text-xl font-bold">Readable, calm, and SEO-ready</p>
                    </div>
                    <span className="rounded-full bg-[var(--brand-cream)] px-3 py-2 text-sm font-bold text-[var(--brand-charcoal)]">
                      2026 UX
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      ['Curriculum completion', '88%'],
                      ['Student engagement', 'High'],
                      ['Certificate issuance', 'Automated'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between rounded-2xl bg-[var(--surface-elevated)] px-4 py-3">
                        <span className="text-sm font-semibold text-[var(--text-secondary)]">{label}</span>
                        <span className="text-sm font-extrabold text-[var(--text-primary)]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-3 py-10 sm:px-5 lg:px-6">
        <div className="page-shell">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="space-y-3">
              <span className="eyebrow">Core capabilities</span>
              <h2 className="max-w-2xl text-3xl font-extrabold sm:text-4xl">Everything learners need, without visual noise.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[var(--text-secondary)]">
              The interface is designed for educational clarity first: faster scanning, stronger hierarchy, and a calm color system for long sessions.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass-card group"
              >
                <div className="mb-5 inline-flex rounded-[1.2rem] bg-[var(--surface-strong)] p-3 text-[var(--brand-blue)]">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-base leading-7 text-[var(--text-secondary)]">{feature.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-10 sm:px-5 lg:px-6">
        <div className="page-shell">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-[2.2rem] px-5 py-8 sm:px-8 lg:px-10"
          >
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-4">
                <span className="eyebrow">Launch your learning ecosystem</span>
                <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to turn this design system into the full website?</h2>
                <p className="max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
                  This first implementation sets the palette, responsive structure, day and night mode, and SEO baseline. The next step is applying the same system to the remaining pages.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link to="/register" className="btn-primary">
                  Create Account
                </Link>
                <Link to="/login" className="btn-secondary">
                  Open Platform
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
